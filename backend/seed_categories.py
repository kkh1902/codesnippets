"""
Seed initial categories for the code snippets application
Run this script once to populate the database with initial categories
"""
from app.core.database import SessionLocal
from app.models.category import Category

# Define category structure
CATEGORIES = [
    # Frontend
    {"name": "Frontend", "slug": "frontend", "parent": None, "order": 1},
    {"name": "React", "slug": "react", "parent": "frontend", "order": 1},
    {"name": "Hooks", "slug": "react-hooks", "parent": "react", "order": 1},
    {"name": "Router", "slug": "react-router", "parent": "react", "order": 2},
    {"name": "State Mgmt", "slug": "react-state", "parent": "react", "order": 3},
    {"name": "Performance", "slug": "react-performance", "parent": "react", "order": 4},
    {"name": "Testing", "slug": "react-testing", "parent": "react", "order": 5},

    {"name": "Next.js", "slug": "nextjs", "parent": "frontend", "order": 2},
    {"name": "Routing", "slug": "nextjs-routing", "parent": "nextjs", "order": 1},
    {"name": "Data Fetching", "slug": "nextjs-data", "parent": "nextjs", "order": 2},
    {"name": "Auth", "slug": "nextjs-auth", "parent": "nextjs", "order": 3},
    {"name": "Image/SEO", "slug": "nextjs-seo", "parent": "nextjs", "order": 4},
    {"name": "Deployment", "slug": "nextjs-deployment", "parent": "nextjs", "order": 5},

    {"name": "UI/CSS", "slug": "ui-css", "parent": "frontend", "order": 3},
    {"name": "Tailwind", "slug": "tailwind", "parent": "ui-css", "order": 1},
    {"name": "CSS Architecture", "slug": "css-architecture", "parent": "ui-css", "order": 2},
    {"name": "shadcn/ui", "slug": "shadcn-ui", "parent": "ui-css", "order": 3},
    {"name": "Animation", "slug": "animation", "parent": "ui-css", "order": 4},

    {"name": "Build/Tooling", "slug": "build-tooling", "parent": "frontend", "order": 4},
    {"name": "Vite", "slug": "vite", "parent": "build-tooling", "order": 1},
    {"name": "Webpack", "slug": "webpack", "parent": "build-tooling", "order": 2},
    {"name": "ESLint/Prettier", "slug": "linting", "parent": "build-tooling", "order": 3},
    {"name": "Storybook", "slug": "storybook", "parent": "build-tooling", "order": 4},

    # Backend
    {"name": "Backend", "slug": "backend", "parent": None, "order": 2},
    {"name": "Python/FastAPI", "slug": "fastapi", "parent": "backend", "order": 1},
    {"name": "Routing", "slug": "fastapi-routing", "parent": "fastapi", "order": 1},
    {"name": "Pydantic", "slug": "pydantic", "parent": "fastapi", "order": 2},
    {"name": "Auth/JWT", "slug": "fastapi-auth", "parent": "fastapi", "order": 3},
    {"name": "Background Tasks", "slug": "fastapi-tasks", "parent": "fastapi", "order": 4},
    {"name": "Testing", "slug": "fastapi-testing", "parent": "fastapi", "order": 5},

    {"name": "Java/Spring", "slug": "spring", "parent": "backend", "order": 2},
    {"name": "MVC", "slug": "spring-mvc", "parent": "spring", "order": 1},
    {"name": "JPA", "slug": "spring-jpa", "parent": "spring", "order": 2},
    {"name": "Security", "slug": "spring-security", "parent": "spring", "order": 3},
    {"name": "RestDocs", "slug": "spring-restdocs", "parent": "spring", "order": 4},

    {"name": "Node/NestJS", "slug": "nestjs", "parent": "backend", "order": 3},
    {"name": "Modules", "slug": "nestjs-modules", "parent": "nestjs", "order": 1},
    {"name": "Guards", "slug": "nestjs-guards", "parent": "nestjs", "order": 2},
    {"name": "Validation", "slug": "nestjs-validation", "parent": "nestjs", "order": 3},
    {"name": "Swagger", "slug": "nestjs-swagger", "parent": "nestjs", "order": 4},

    {"name": "API 설계", "slug": "api-design", "parent": "backend", "order": 4},
    {"name": "REST", "slug": "rest", "parent": "api-design", "order": 1},
    {"name": "OpenAPI", "slug": "openapi", "parent": "api-design", "order": 2},
    {"name": "Rate Limit", "slug": "rate-limit", "parent": "api-design", "order": 3},
    {"name": "Idempotency", "slug": "idempotency", "parent": "api-design", "order": 4},

    {"name": "DB", "slug": "database", "parent": "backend", "order": 5},
    {"name": "PostgreSQL", "slug": "postgresql", "parent": "database", "order": 1},
    {"name": "Schema Design", "slug": "schema-design", "parent": "database", "order": 2},
    {"name": "Indexing", "slug": "indexing", "parent": "database", "order": 3},
    {"name": "Transaction", "slug": "transaction", "parent": "database", "order": 4},

    # Data Engineering
    {"name": "Data Engineering", "slug": "data-engineering", "parent": None, "order": 3},
    {"name": "Kafka", "slug": "kafka", "parent": "data-engineering", "order": 1},
    {"name": "Producer/Consumer", "slug": "kafka-basics", "parent": "kafka", "order": 1},
    {"name": "Partitions", "slug": "kafka-partitions", "parent": "kafka", "order": 2},
    {"name": "Consumer Group", "slug": "kafka-consumer-group", "parent": "kafka", "order": 3},
    {"name": "Schema Registry", "slug": "kafka-schema", "parent": "kafka", "order": 4},

    {"name": "Spark", "slug": "spark", "parent": "data-engineering", "order": 2},
    {"name": "DataFrame", "slug": "spark-dataframe", "parent": "spark", "order": 1},
    {"name": "Streaming", "slug": "spark-streaming", "parent": "spark", "order": 2},
    {"name": "Window", "slug": "spark-window", "parent": "spark", "order": 3},
    {"name": "UDF", "slug": "spark-udf", "parent": "spark", "order": 4},

    {"name": "Airflow", "slug": "airflow", "parent": "data-engineering", "order": 3},
    {"name": "Operators", "slug": "airflow-operators", "parent": "airflow", "order": 1},
    {"name": "XCom", "slug": "airflow-xcom", "parent": "airflow", "order": 2},
    {"name": "Triggers", "slug": "airflow-triggers", "parent": "airflow", "order": 3},
    {"name": "DAG Best Practices", "slug": "airflow-dag", "parent": "airflow", "order": 4},

    {"name": "ETL/ELT", "slug": "etl", "parent": "data-engineering", "order": 4},
    {"name": "Batch vs Streaming", "slug": "batch-streaming", "parent": "etl", "order": 1},
    {"name": "Upsert", "slug": "upsert", "parent": "etl", "order": 2},
    {"name": "CDC", "slug": "cdc", "parent": "etl", "order": 3},
    {"name": "Data Quality", "slug": "data-quality", "parent": "etl", "order": 4},

    {"name": "Storage", "slug": "storage", "parent": "data-engineering", "order": 5},
    {"name": "S3", "slug": "s3", "parent": "storage", "order": 1},
    {"name": "Parquet", "slug": "parquet", "parent": "storage", "order": 2},
    {"name": "Partitioning", "slug": "partitioning", "parent": "storage", "order": 3},
    {"name": "Glue/Athena", "slug": "glue-athena", "parent": "storage", "order": 4},

    # DevOps/Infra
    {"name": "DevOps/Infra", "slug": "devops", "parent": None, "order": 4},
    {"name": "Docker", "slug": "docker", "parent": "devops", "order": 1},
    {"name": "Multi-stage", "slug": "docker-multistage", "parent": "docker", "order": 1},
    {"name": "Compose", "slug": "docker-compose", "parent": "docker", "order": 2},
    {"name": "Image 최적화", "slug": "docker-optimization", "parent": "docker", "order": 3},

    {"name": "Kubernetes", "slug": "kubernetes", "parent": "devops", "order": 2},
    {"name": "Deploy/Service", "slug": "k8s-basics", "parent": "kubernetes", "order": 1},
    {"name": "ConfigMap/Secret", "slug": "k8s-config", "parent": "kubernetes", "order": 2},
    {"name": "HPA", "slug": "k8s-hpa", "parent": "kubernetes", "order": 3},
    {"name": "Spark Operator", "slug": "k8s-spark", "parent": "kubernetes", "order": 4},

    {"name": "Observability", "slug": "observability", "parent": "devops", "order": 3},
    {"name": "Prometheus", "slug": "prometheus", "parent": "observability", "order": 1},
    {"name": "Grafana", "slug": "grafana", "parent": "observability", "order": 2},
    {"name": "Exporter", "slug": "exporter", "parent": "observability", "order": 3},
    {"name": "Loki", "slug": "loki", "parent": "observability", "order": 4},

    {"name": "CI/CD", "slug": "cicd", "parent": "devops", "order": 4},
    {"name": "GitHub Actions", "slug": "github-actions", "parent": "cicd", "order": 1},
    {"name": "ArgoCD", "slug": "argocd", "parent": "cicd", "order": 2},

    # AI/ML
    {"name": "AI/ML", "slug": "ai-ml", "parent": None, "order": 5},
    {"name": "ML 기초", "slug": "ml-basics", "parent": "ai-ml", "order": 1},
    {"name": "데이터 전처리", "slug": "ml-preprocessing", "parent": "ml-basics", "order": 1},
    {"name": "모델 평가", "slug": "ml-evaluation", "parent": "ml-basics", "order": 2},
    {"name": "Overfitting", "slug": "ml-overfitting", "parent": "ml-basics", "order": 3},

    {"name": "LLM/Agents", "slug": "llm", "parent": "ai-ml", "order": 2},
    {"name": "OpenAI API", "slug": "openai-api", "parent": "llm", "order": 1},
    {"name": "RAG", "slug": "rag", "parent": "llm", "order": 2},
    {"name": "Embedding", "slug": "embedding", "parent": "llm", "order": 3},
    {"name": "Vector DB", "slug": "vector-db", "parent": "llm", "order": 4},

    {"name": "MLOps", "slug": "mlops", "parent": "ai-ml", "order": 3},
    {"name": "모델 배포", "slug": "mlops-deployment", "parent": "mlops", "order": 1},
    {"name": "모니터링", "slug": "mlops-monitoring", "parent": "mlops", "order": 2},
    {"name": "피드백 루프", "slug": "mlops-feedback", "parent": "mlops", "order": 3},

    # FinTech
    {"name": "FinTech/결제", "slug": "fintech", "parent": None, "order": 6},
    {"name": "결제 도메인", "slug": "payment", "parent": "fintech", "order": 1},
    {"name": "승인/매입/정산", "slug": "payment-flow", "parent": "payment", "order": 1},
    {"name": "결제 취소", "slug": "payment-cancel", "parent": "payment", "order": 2},
    {"name": "멱등성 키", "slug": "payment-idempotency", "parent": "payment", "order": 3},
    {"name": "리트라이 전략", "slug": "payment-retry", "parent": "payment", "order": 4},

    {"name": "보안/컴플라이언스", "slug": "security-compliance", "parent": "fintech", "order": 2},
    {"name": "PCI-DSS", "slug": "pci-dss", "parent": "security-compliance", "order": 1},
    {"name": "암호화/KMS", "slug": "encryption-kms", "parent": "security-compliance", "order": 2},
    {"name": "로그 마스킹", "slug": "log-masking", "parent": "security-compliance", "order": 3},

    {"name": "가상자산", "slug": "crypto", "parent": "fintech", "order": 3},
    {"name": "주소/트랜잭션", "slug": "crypto-basics", "parent": "crypto", "order": 1},
    {"name": "지갑", "slug": "crypto-wallet", "parent": "crypto", "order": 2},
    {"name": "Confirmations", "slug": "crypto-confirmations", "parent": "crypto", "order": 3},
    {"name": "Web3 Provider", "slug": "web3-provider", "parent": "crypto", "order": 4},

    {"name": "거래데이터", "slug": "trading-data", "parent": "fintech", "order": 4},
    {"name": "체결/호가 스트림", "slug": "order-stream", "parent": "trading-data", "order": 1},
    {"name": "리스크/알림", "slug": "risk-alert", "parent": "trading-data", "order": 2},

    # Cloud
    {"name": "Cloud", "slug": "cloud", "parent": None, "order": 7},
    {"name": "AWS", "slug": "aws", "parent": "cloud", "order": 1},
    {"name": "IAM", "slug": "aws-iam", "parent": "aws", "order": 1},
    {"name": "S3", "slug": "aws-s3", "parent": "aws", "order": 2},
    {"name": "EC2", "slug": "aws-ec2", "parent": "aws", "order": 3},
    {"name": "MSK", "slug": "aws-msk", "parent": "aws", "order": 4},
    {"name": "EKS", "slug": "aws-eks", "parent": "aws", "order": 5},
    {"name": "Glue", "slug": "aws-glue", "parent": "aws", "order": 6},
    {"name": "Redshift", "slug": "aws-redshift", "parent": "aws", "order": 7},

    {"name": "GCP", "slug": "gcp", "parent": "cloud", "order": 2},
    {"name": "GCS", "slug": "gcp-gcs", "parent": "gcp", "order": 1},
    {"name": "GKE", "slug": "gcp-gke", "parent": "gcp", "order": 2},
    {"name": "BigQuery", "slug": "gcp-bigquery", "parent": "gcp", "order": 3},
    {"name": "Pub/Sub", "slug": "gcp-pubsub", "parent": "gcp", "order": 4},

    # CS/면접 준비
    {"name": "CS/면접", "slug": "cs-interview", "parent": None, "order": 8},
    {"name": "알고리즘", "slug": "algorithm", "parent": "cs-interview", "order": 1},
    {"name": "배열/해시", "slug": "array-hash", "parent": "algorithm", "order": 1},
    {"name": "그래프", "slug": "graph", "parent": "algorithm", "order": 2},
    {"name": "DP", "slug": "dp", "parent": "algorithm", "order": 3},

    {"name": "네트워크", "slug": "network", "parent": "cs-interview", "order": 2},
    {"name": "TCP/HTTP", "slug": "tcp-http", "parent": "network", "order": 1},
    {"name": "gRPC", "slug": "grpc", "parent": "network", "order": 2},
    {"name": "로드밸런싱", "slug": "load-balancing", "parent": "network", "order": 3},

    {"name": "운영체제/DB", "slug": "os-db", "parent": "cs-interview", "order": 3},
    {"name": "Index", "slug": "db-index", "parent": "os-db", "order": 1},
    {"name": "Lock", "slug": "db-lock", "parent": "os-db", "order": 2},
    {"name": "Isolation", "slug": "db-isolation", "parent": "os-db", "order": 3},
    {"name": "Deadlock", "slug": "deadlock", "parent": "os-db", "order": 4},

    {"name": "시스템 디자인", "slug": "system-design", "parent": "cs-interview", "order": 4},
    {"name": "확장성", "slug": "scalability", "parent": "system-design", "order": 1},
    {"name": "내결함성", "slug": "fault-tolerance", "parent": "system-design", "order": 2},
    {"name": "캐시", "slug": "cache", "parent": "system-design", "order": 3},
    {"name": "메시지 큐", "slug": "message-queue", "parent": "system-design", "order": 4},

    # 프로젝트/포트폴리오
    {"name": "프로젝트", "slug": "project", "parent": None, "order": 9},
    {"name": "실전 파이프라인", "slug": "pipeline-project", "parent": "project", "order": 1},
    {"name": "아키텍처", "slug": "architecture", "parent": "project", "order": 2},
    {"name": "리드미/데모", "slug": "readme-demo", "parent": "project", "order": 3},

    # 도구 & 노트
    {"name": "도구 & 노트", "slug": "tools", "parent": None, "order": 10},
    {"name": "CLI", "slug": "cli", "parent": "tools", "order": 1},
    {"name": "편집기", "slug": "editor", "parent": "tools", "order": 2},
    {"name": "문서 템플릿", "slug": "templates", "parent": "tools", "order": 3},
]

def seed_categories():
    db = SessionLocal()

    try:
        # Check if categories already exist
        existing = db.query(Category).first()
        if existing:
            print("Categories already exist. Skipping seed.")
            return

        # First pass: create all categories without parent relationships
        category_map = {}
        for cat_data in CATEGORIES:
            category = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                order=cat_data["order"]
            )
            db.add(category)
            db.flush()  # Flush to get the ID
            category_map[cat_data["slug"]] = category

        # Second pass: set parent relationships
        for cat_data in CATEGORIES:
            if cat_data["parent"]:
                category = category_map[cat_data["slug"]]
                parent = category_map[cat_data["parent"]]
                category.parent_id = parent.id

        db.commit()
        print(f"Successfully seeded {len(CATEGORIES)} categories!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding categories: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_categories()
