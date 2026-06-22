import os
import json
import subprocess
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from database import init_tables, execute_query
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_role
)

app = FastAPI(title="Financial Forecasting System - API Layer")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vite origin e.g. http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB initialization
@app.on_event("startup")
def startup_event():
    init_tables()

# Pydantic schemas
class UserRegister(BaseModel):
    fullname: str
    email: EmailStr
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForecastRequest(BaseModel):
    horizon: Optional[int] = 12
    fixed_overhead: Optional[float] = 20000.0

# ----------------- Auth Endpoints -----------------

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister):
    hashed_pwd = get_password_hash(user.password)
    try:
        execute_query(
            "INSERT INTO users (fullname, email, password, role) VALUES ($1, $2, $3, $4)",
            [user.fullname, user.email, hashed_pwd, user.role]
        )
        return {"status": "success", "message": "User registered successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email already registered or validation failed. Error: {e}"
        )

@app.post("/login")
def login(credentials: UserLogin):
    users = execute_query("SELECT * FROM users WHERE email = $1", [credentials.email])
    if not users:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    user = users[0]
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"], "fullname": user["fullname"]}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "fullname": user["fullname"],
            "email": user["email"],
            "role": user["role"]
        }
    }

# ----------------- Data Endpoints -----------------

@app.get("/sales")
def get_sales(current_user: dict = Depends(get_current_user_role)):
    try:
        sales_data = execute_query("SELECT date, sales, revenue, expenses, profit FROM sales ORDER BY date ASC")
        return sales_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user_role)):
    if current_user["role"] not in ["Admin", "Business Owner"]:
        raise HTTPException(status_code=403, detail="Unauthorized role permissions.")
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV dataset.")
        
    try:
        # Load and parse CSV
        df = pd.read_csv(file.file)
        
        # Validate headers
        required_cols = {"Date", "Sales", "Revenue", "Expenses"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain headers: {', '.join(required_cols)}"
            )
            
        # Clean and insert rows
        inserted_count = 0
        duplicate_count = 0
        missing_count = 0
        
        for _, row in df.iterrows():
            date_val = str(row["Date"]).strip()
            sales_val = row["Sales"]
            revenue_val = row["Revenue"]
            expenses_val = row["Expenses"]
            
            # Missing detection
            if pd.isna(date_val) or pd.isna(sales_val) or pd.isna(revenue_val) or pd.isna(expenses_val):
                missing_count += 1
                continue
                
            profit_val = float(revenue_val) - float(expenses_val)
            
            try:
                execute_query(
                    "INSERT INTO sales (date, sales, revenue, expenses, profit) VALUES ($1, $2, $3, $4, $5)",
                    [date_val, int(sales_val), float(revenue_val), float(expenses_val), profit_val]
                )
                inserted_count += 1
            except Exception:
                # Duplicate date insert error
                duplicate_count += 1
                
        return {
            "status": "success",
            "records_inserted": inserted_count,
            "duplicates_ignored": duplicate_count,
            "missing_fields_cleaned": missing_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV processing failed: {str(e)}")

# ----------------- R Forecasting Subprocesses -----------------

def run_r_script(script_name: str, payload_data: List[dict], extra_args: List[str] = None) -> dict:
    """Invokes designated R analytics engine via subprocess, providing stdin input."""
    script_path = os.path.join("..", "analytics", script_name)
    if not os.path.exists(script_path):
        raise HTTPException(status_code=500, detail=f"R forecast engine script {script_name} missing.")
        
    input_payload = json.dumps(payload_data)
    cmd = ["Rscript", script_path] + (extra_args or [])
    
    try:
        proc = subprocess.run(
            cmd,
            input=input_payload,
            text=True,
            capture_output=True,
            timeout=10
        )
        
        if proc.returncode != 0:
            print(f"Rscript Error stderr: {proc.stderr}")
            # R environment is missing or failed - trigger local python simulation fallback
            return run_python_fallback_simulation(script_name, payload_data, extra_args)
            
        return json.loads(proc.stdout)
    except Exception as e:
        print(f"Subprocess execute failed: {e}. Falling back to Python forecast simulation.")
        return run_python_fallback_simulation(script_name, payload_data, extra_args)

def run_python_fallback_simulation(script_name: str, payload: List[dict], extra_args: List[str]) -> dict:
    """Mock fallback simulation in Python if R isn't installed locally (ensures app works)."""
    # Simple linear trend simulation matching R engine output interface
    horizon = 12
    if extra_args and "--horizon" in extra_args:
        horizon = int(extra_args[extra_args.index("--horizon") + 1])
        
    last = payload[-1]
    metric = "sales"
    if "revenue" in script_name:
        metric = "revenue"
    elif "expense" in script_name:
        metric = "expenses"
    elif "profit" in script_name:
        metric = "profit"
        
    predictions = []
    base_val = float(last.get(metric, 100))
    
    for i in range(1, horizon + 1):
        predicted = base_val * (1 + 0.02 * i) # simple 2% monthly increase
        predictions.append({
            "date": f"2026-{i:02d}",
            "predicted": predicted,
            "predicted_sales": predicted,
            "predicted_revenue": predicted,
            "predicted_expenses": predicted,
            "predicted_profit": predicted * 0.2, # 20% profit margin
            "predicted_margin": 20.0,
            "fixed_component": 20000.0,
            "variable_component": max(0.0, predicted - 20000.0),
            "lower_95": predicted * 0.9,
            "upper_95": predicted * 1.1,
            "lower_80": predicted * 0.95,
            "upper_80": predicted * 1.05
        })
        
    return {
        "status": "success",
        "model": "Python Mock Fallback",
        "predictions": predictions,
        "revenue_growth_pct": 5.0,
        "expense_growth_pct": 4.5,
        "alerts": ["Warning: Running under Python local fallback projection (R script environment unreached)."]
    }

@app.post("/forecast/sales")
def forecast_sales(req: ForecastRequest, current_user: dict = Depends(get_current_user_role)):
    history = execute_query("SELECT date, sales FROM sales ORDER BY date ASC")
    if not history:
        raise HTTPException(status_code=400, detail="Insufficient historical dataset records.")
    return run_r_script("sales_forecast.R", history, ["--horizon", str(req.horizon)])

@app.post("/forecast/revenue")
def forecast_revenue(req: ForecastRequest, current_user: dict = Depends(get_current_user_role)):
    history = execute_query("SELECT date, revenue FROM sales ORDER BY date ASC")
    if not history:
        raise HTTPException(status_code=400, detail="Insufficient historical dataset records.")
    return run_r_script("revenue_forecast.R", history, ["--horizon", str(req.horizon)])

@app.post("/forecast/expenses")
def forecast_expenses(req: ForecastRequest, current_user: dict = Depends(get_current_user_role)):
    history = execute_query("SELECT date, expenses FROM sales ORDER BY date ASC")
    if not history:
        raise HTTPException(status_code=400, detail="Insufficient historical dataset records.")
    return run_r_script(
        "expense_forecast.R", 
        history, 
        ["--horizon", str(req.horizon), "--fixed", str(req.fixed_overhead)]
    )

@app.post("/forecast/profit")
def forecast_profit(req: ForecastRequest, current_user: dict = Depends(get_current_user_role)):
    history = execute_query("SELECT date, revenue, expenses FROM sales ORDER BY date ASC")
    if not history:
        raise HTTPException(status_code=400, detail="Insufficient historical dataset records.")
    return run_r_script("profit_forecast.R", history, ["--horizon", str(req.horizon)])
