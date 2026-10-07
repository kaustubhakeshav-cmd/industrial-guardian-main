# 🛡️ Industrial Guardian: AI-Driven SCADA Anomaly Detection System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

## 📖 Abstract
**Industrial Guardian** is a next-generation, real-time SCADA monitoring platform designed to detect, analyze, and resolve industrial anomalies proactively. Unlike traditional threshold-based systems, this project integrates **eight distinct Machine Learning and AI modules**—including predictive forecasting, unsupervised anomaly detection, real-time clustering, and a Retrieval-Augmented Generation (RAG) assistant—to provide operators with actionable, explainable intelligence.

---

## ✨ Key AI/ML Features

1. **Predictive Anomaly Forecasting**: Uses linear regression over rolling time windows to predict sensor values for the next 10 seconds, rendering "ghost lines" on live charts to flag threshold breaches *before* they occur.
2. **Dynamic System Health Score**: Multivariate Z-Score analysis that continuously calculates a 0-100% health metric based on statistical deviations of critical sensors from historical baselines.
3. **AI Root Cause Analysis (XAI)**: Temporal correlation engine that queries concurrent sensor data (±5s window) during an anomaly to generate human-readable causal explanations (e.g., *"Pressure spike strongly correlated with Flow drop → Likely downstream blockage"*).
4. **Smart Assignee Recommendation**: Heuristic mode analysis that evaluates historical incident resolution rates to recommend the optimal engineer/operator for a specific sensor anomaly, reducing Mean Time To Resolution (MTTR).
5. **Real-Time Operational Mode Clustering**: Lightweight, pure-Python Streaming K-Means (k=3) that classifies the plant's current multivariate state into "Steady State", "Transitional Load", or "Critical Deviation" in <15ms.
6. **Remaining Useful Life (RUL) Prediction**: Condition-based degradation proxy model that aggregates cumulative anomaly stress and statistical deviation to estimate operational lifespan reduction.
7. **Multivariate Sensor Correlation Matrix**: Real-time Pearson Correlation Coefficient calculation (rolling 50-reading window) to detect cascading failure modes and systemic dependencies.
8. **RAG-Powered AI Plant Assistant**: Keyword-based vector retrieval system that answers natural language queries by citing specific operational manuals and safety protocols from a localized SCADA knowledge base.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph "Frontend (React + TypeScript + Tailwind CSS)"
        UI[Dashboard & Sensor Views]
        Chat[RAG AI Assistant]
        Sim[Mission Control Simulation]
        Reports[Analytics & Reporting]
    end

    subgraph "Backend (FastAPI + WebSockets)"
        API[REST API Endpoints]
        WS[Real-time WebSocket Stream]
        ML_Forecast[Time-Series Forecasting]
        ML_Health[Z-Score Health Engine]
        ML_RCA[Causal Root Cause Analysis]
        ML_RUL[RUL Degradation Model]
        ML_Cluster[Streaming K-Means Clustering]
        ML_RAG[Keyword-based RAG Retrieval]
    end

    subgraph "Data & Infrastructure Layer"
        DB[(PostgreSQL)]
        KB[(SCADA Knowledge Base)]
    end

    UI -->|HTTP/REST| API
    UI -->|WebSocket| WS
    Chat -->|Natural Language Query| ML_RAG
    Sim -->|Trigger Injection| API
    
    API --> DB
    WS --> DB
    
    API --> ML_Forecast
    API --> ML_Health
    API --> ML_RCA
    API --> ML_RUL
    API --> ML_Cluster
    
    ML_RAG --> KB
    ML_RCA --> DB
    ML_RUL --> DB
    ML_Health --> DB
    ML_Forecast --> DB
    ML_Cluster --> DB

    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef data fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    
    class UI,Chat,Sim,Reports frontend;
    class API,WS,ML_Forecast,ML_Health,ML_RCA,ML_RUL,ML_Cluster,ML_RAG backend;
    class DB,KB data;