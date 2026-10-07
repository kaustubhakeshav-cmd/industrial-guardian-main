# 🛡️ Industrial Guardian: A Self-Supervised Temporal Transformer Framework for Robust Anomaly Detection in Industrial Control Systems

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1.0-EE4C2C?logo=pytorch)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

## 📖 Abstract
**Industrial Guardian** is a next-generation, real-time SCADA monitoring platform designed to detect, analyze, and resolve industrial anomalies proactively. Unlike traditional systems that rely on static thresholds or heavy, black-box deep learning, this project implements a **hybrid edge-cloud architecture**. It utilizes lightweight, self-supervised statistical models for sub-15ms real-time edge inference, while seamlessly integrating a **PyTorch Temporal Transformer Encoder** for offline, deep-dive sequence validation. This ensures mathematical explainability, zero-shot baseline calibration, and robust adaptation to operational distribution shifts (concept drift) without requiring manual retraining.

---

## ✨ Key AI/ML Features

1. **Predictive Anomaly Forecasting**: Rolling-window linear regression projects sensor trajectories to flag threshold breaches *before* they occur, rendering "ghost lines" on live charts.
2. **Dynamic System Health Score**: Multivariate Z-Score analysis continuously calculates a 0-100% health metric based on statistical deviations of critical sensors from historical baselines.
3. **AI Root Cause Analysis (XAI)**: Temporal Pearson Correlation matrices evaluate concurrent sensor data (±5s window) to generate human-readable causal explanations (e.g., *"Pressure spike strongly correlated with Flow drop → Likely downstream blockage"*).
4. **Smart Assignee Recommendation**: Heuristic collaborative filtering evaluates historical incident resolution rates to recommend the optimal engineer, reducing Mean Time To Resolution (MTTR).
5. **Real-Time Operational Mode Clustering**: Lightweight Streaming K-Means (k=3) classifies the plant's multivariate state into "Steady", "Transitional", or "Critical" in <15ms.
6. **Remaining Useful Life (RUL) Prediction**: Condition-based degradation proxy model that aggregates cumulative anomaly stress to estimate operational lifespan reduction.
7. **Temporal Transformer Validation**: A dedicated PyTorch `TransformerEncoder` module processes multivariate time-series sequences offline to validate statistical alerts, fulfilling the deep-learning aspect of the research framework.
8. **RAG-Powered AI Plant Assistant**: Localized, deterministic keyword retrieval system that answers natural language queries by citing specific operational manuals, preventing LLM hallucinations.

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

    subgraph "Backend (FastAPI + WebSockets + PyTorch)"
        API[REST API Endpoints]
        WS[Real-time WebSocket Stream]
        ML_Edge[Z-Score & K-Means Edge Inference]
        ML_Transformer[PyTorch Temporal Transformer Encoder]
        ML_RAG[Localized RAG Retrieval]
    end

    subgraph "Data & Infrastructure Layer"
        DB[(PostgreSQL)]
        KB[(SCADA Knowledge Base)]
    end

    UI -->|HTTP/REST| API
    UI -->|WebSocket| WS
    Chat -->|Natural Language Query| ML_RAG
    Sim -->|Physics-Informed Injection| API
    
    API --> DB
    WS --> DB
    
    API --> ML_Edge
    API --> ML_Transformer
    
    ML_RAG --> KB
    ML_Edge --> DB
    ML_Transformer --> DB

    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef data fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    
    class UI,Chat,Sim,Reports frontend;
    class API,WS,ML_Edge,ML_Transformer,ML_RAG backend;
    class DB,KB data;