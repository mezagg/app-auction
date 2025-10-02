from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from bson import ObjectId
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Pydantic Models
class AuctionItem(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    item_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # vehiculos, camiones, equipo_medico
    subcategory: str  # sedan, suv, resonancia, etc.
    brand: str
    model: Optional[str] = None
    year: Optional[int] = None
    starting_price: float
    current_bid: float
    estimated_value: Dict[str, float]  # {"min": 50000, "max": 75000}
    images: List[str]  # base64 encoded images
    condition: str  # excelente, bueno, regular, para_reparacion
    mileage: Optional[int] = None
    specifications: Dict[str, Any]
    location: str
    auction_id: str

    class Config:
        allow_population_by_field_name = True

class Auction(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    auction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    reason: str  # cierre_empresa, renovacion_flotilla
    company_name: str
    start_date: datetime
    end_date: datetime
    status: str  # proxima, activa, finalizada
    location: str
    state: str
    total_items: int = 0
    registration_fee: float = 500.0  # Tarifa de inscripción en pesos mexicanos
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True

class User(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    phone: str
    company: Optional[str] = None
    password_hash: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    registered_auctions: List[str] = []

    class Config:
        allow_population_by_field_name = True

class UserRegister(BaseModel):
    email: str
    full_name: str
    phone: str
    company: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Auth functions
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"user_id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Initialize sample data
async def init_sample_data():
    # Check if data already exists
    existing_auctions = await db.auctions.count_documents({})
    if existing_auctions > 0:
        return
    
    # Sample auctions data
    sample_auctions = [
        {
            "title": "Liquidación Flota Ejecutiva - Grupo Empresarial Monterrey",
            "description": "Subasta por renovación de flotilla empresarial. Vehículos ejecutivos en excelente estado con mantenimiento premium.",
            "reason": "renovacion_flotilla",
            "company_name": "Grupo Empresarial Monterrey S.A. de C.V.",
            "start_date": datetime.utcnow() + timedelta(days=5),
            "end_date": datetime.utcnow() + timedelta(days=6),
            "status": "proxima",
            "location": "Centro de Convenciones Monterrey, Nuevo León",
            "state": "Nuevo León",
            "registration_fee": 750.0,
            "total_items": 15
        },
        {
            "title": "Cierre Hospital Regional - Equipo Médico Especializado",
            "description": "Liquidación por cierre de hospital. Equipo médico de última generación en condiciones operativas.",
            "reason": "cierre_empresa",
            "company_name": "Hospital Regional San José",
            "start_date": datetime.utcnow() + timedelta(days=12),
            "end_date": datetime.utcnow() + timedelta(days=13),
            "status": "proxima",
            "location": "Instalaciones Hospitalarias, Ciudad de México",
            "state": "Ciudad de México",
            "registration_fee": 1000.0,
            "total_items": 25
        },
        {
            "title": "Transportes del Norte - Flotilla Comercial",
            "description": "Cierre de empresa de transportes. Camiones y vehículos comerciales con documentación en orden.",
            "reason": "cierre_empresa",
            "company_name": "Transportes del Norte S.A.",
            "start_date": datetime.utcnow() - timedelta(days=2),
            "end_date": datetime.utcnow() + timedelta(hours=8),
            "status": "activa",
            "location": "Patio Industrial Tijuana, Baja California",
            "state": "Baja California",
            "registration_fee": 500.0,
            "total_items": 32
        }
    ]
    
    for auction_data in sample_auctions:
        auction = Auction(**auction_data)
        await db.auctions.insert_one(auction.dict(by_alias=True, exclude={"id"}))

    # Sample auction items
    sample_items = [
        # Vehículos ejecutivos
        {
            "name": "BMW Serie 5 530i",
            "description": "Vehículo ejecutivo en excelente estado. Servicio de mantenimiento premium. Interior en cuero, sistema de navegación, asientos calefaccionables.",
            "category": "vehiculos",
            "subcategory": "sedan_ejecutivo",
            "brand": "BMW",
            "model": "530i",
            "year": 2022,
            "starting_price": 450000.0,
            "current_bid": 485000.0,
            "estimated_value": {"min": 520000, "max": 580000},
            "images": ["iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="],
            "condition": "excelente",
            "mileage": 45000,
            "specifications": {
                "motor": "2.0L Turbo",
                "combustible": "Gasolina",
                "transmision": "Automática 8 velocidades",
                "traccion": "Trasera",
                "color": "Negro Carbón"
            },
            "location": "Monterrey, Nuevo León",
            "auction_id": ""
        },
        # Camiones
        {
            "name": "Freightliner Cascadia 2021",
            "description": "Tractocamión de carga pesada. Motor Detroit Diesel, transmisión manual. Ideal para transporte de larga distancia.",
            "category": "camiones",
            "subcategory": "tractocamion",
            "brand": "Freightliner",
            "model": "Cascadia",
            "year": 2021,
            "starting_price": 850000.0,
            "current_bid": 920000.0,
            "estimated_value": {"min": 1200000, "max": 1400000},
            "images": ["iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="],
            "condition": "bueno",
            "mileage": 180000,
            "specifications": {
                "motor": "Detroit Diesel DD13",
                "potencia": "475 HP",
                "transmision": "Manual 10 velocidades",
                "capacidad_carga": "36,000 kg",
                "color": "Blanco"
            },
            "location": "Tijuana, Baja California",
            "auction_id": ""
        },
        # Equipo médico
        {
            "name": "Resonancia Magnética Siemens Magnetom",
            "description": "Equipo de resonancia magnética 1.5T. Completamente operativo. Incluye mesa paciente y accesorios.",
            "category": "equipo_medico",
            "subcategory": "resonancia_magnetica",
            "brand": "Siemens",
            "model": "Magnetom Essenza",
            "year": 2020,
            "starting_price": 2500000.0,
            "current_bid": 2500000.0,
            "estimated_value": {"min": 3500000, "max": 4200000},
            "images": ["iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="],
            "condition": "excelente",
            "specifications": {
                "potencia_campo": "1.5 Tesla",
                "tipo_magnetismo": "Superconductor",
                "diametro_tunel": "60 cm",
                "peso_aproximado": "4,500 kg",
                "estado": "Completamente operativo"
            },
            "location": "Ciudad de México",
            "auction_id": ""
        }
    ]

    auctions = await db.auctions.find().to_list(10)
    for i, item_data in enumerate(sample_items):
        if i < len(auctions):
            item_data["auction_id"] = auctions[i]["auction_id"]
            item = AuctionItem(**item_data)
            await db.auction_items.insert_one(item.dict(by_alias=True, exclude={"id"}))

async def seed_custom_auctions():
    """
    Inserta (si no existen) las subastas solicitadas por el usuario junto con sus lotes,
    usando IDs determinísticos para evitar duplicados.
    """
    # Subasta: Gran Subasta Multimarcas (Webcast) - Jueves 9 de octubre de 2025, termina viernes
    multimarcas_id = "multimarcas-2025-10-09"
    existing_multimarcas = await db.auctions.find_one({"auction_id": multimarcas_id})
    if not existing_multimarcas:
        multimarcas_auction = Auction(
            auction_id=multimarcas_id,
            title="Gran Subasta Multimarcas",
            description=(
                "Webcast | Motocicletas · Automóviles · Rines · Refacciones · Camionetas · "
                "Tractocamiones · Camiones · Cajas Secas · Equipo de Minería · Equipo de Construcción · "
                "Maquinaría Amarilla y mucho más. Inspecciones disponibles: Del 6 al 8 de octubre."
            ),
            reason="renovacion_flotilla",
            company_name="Hilco Global México",
            start_date=datetime(2025, 10, 9, 11, 0),
            end_date=datetime(2025, 10, 10, 18, 0),
            status="proxima",
            location="Vía webcast",
            state="Jalisco",
            total_items=0,
            registration_fee=500.0,
        )
        await db.auctions.insert_one(multimarcas_auction.dict(by_alias=True, exclude={"id"}))

        # Lotes Nissan Tsuru
        base64_placeholder = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        multimarcas_items = [
            {
                "name": "Nissan Tsuru | 2012",
                "description": "Automóvil compacto. Estado general bueno. Incluye documentación básica.",
                "category": "vehiculos",
                "subcategory": "automoviles",
                "brand": "Nissan",
                "model": "Tsuru",
                "year": 2012,
                "starting_price": 30000.0,
                "current_bid": 30000.0,
                "estimated_value": {"min": 28000, "max": 35000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"estado_lote": "VENDIDO", "numero_lote": "11"},
                "location": "Jalisco",
                "auction_id": multimarcas_id,
            },
            {
                "name": "Nissan Tsuru | 2013",
                "description": "Automóvil compacto. Estado general bueno. Incluye documentación básica.",
                "category": "vehiculos",
                "subcategory": "automoviles",
                "brand": "Nissan",
                "model": "Tsuru",
                "year": 2013,
                "starting_price": 35000.0,
                "current_bid": 35000.0,
                "estimated_value": {"min": 32000, "max": 38000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"estado_lote": "VENDIDO", "numero_lote": "11A"},
                "location": "Jalisco",
                "auction_id": multimarcas_id,
            },
            {
                "name": "Nissan Tsuru | 2014",
                "description": "Automóvil compacto. Estado general bueno. Incluye documentación básica.",
                "category": "vehiculos",
                "subcategory": "automoviles",
                "brand": "Nissan",
                "model": "Tsuru",
                "year": 2014,
                "starting_price": 40000.0,
                "current_bid": 40000.0,
                "estimated_value": {"min": 38000, "max": 45000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"estado_lote": "VENDIDO", "numero_lote": "12"},
                "location": "Jalisco",
                "auction_id": multimarcas_id,
            },
            {
                "name": "Nissan Tsuru | 2013",
                "description": "Automóvil compacto. Estado general bueno. Incluye documentación básica.",
                "category": "vehiculos",
                "subcategory": "automoviles",
                "brand": "Nissan",
                "model": "Tsuru",
                "year": 2013,
                "starting_price": 35000.0,
                "current_bid": 35000.0,
                "estimated_value": {"min": 32000, "max": 38000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"estado_lote": "VENDIDO", "numero_lote": "13"},
                "location": "Jalisco",
                "auction_id": multimarcas_id,
            },
            {
                "name": "Nissan Tsuru | 2014",
                "description": "Automóvil compacto. Estado general bueno. Incluye documentación básica.",
                "category": "vehiculos",
                "subcategory": "automoviles",
                "brand": "Nissan",
                "model": "Tsuru",
                "year": 2014,
                "starting_price": 40000.0,
                "current_bid": 40000.0,
                "estimated_value": {"min": 38000, "max": 45000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"estado_lote": "VENDIDO", "numero_lote": "14"},
                "location": "Jalisco",
                "auction_id": multimarcas_id,
            },
            {
                "name": "Nissan Tsuru | 2015",
                "description": "Automóvil compacto. Estado general bueno. Incluye documentación básica.",
                "category": "vehiculos",
                "subcategory": "automoviles",
                "brand": "Nissan",
                "model": "Tsuru",
                "year": 2015,
                "starting_price": 45000.0,
                "current_bid": 45000.0,
                "estimated_value": {"min": 43000, "max": 50000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"estado_lote": "VENDIDO", "numero_lote": "15"},
                "location": "Jalisco",
                "auction_id": multimarcas_id,
            },
            {
                "name": "Nissan Tsuru | 2012",
                "description": "Automóvil compacto. Estado general bueno. Incluye documentación básica.",
                "category": "vehiculos",
                "subcategory": "automoviles",
                "brand": "Nissan",
                "model": "Tsuru",
                "year": 2012,
                "starting_price": 30000.0,
                "current_bid": 30000.0,
                "estimated_value": {"min": 28000, "max": 35000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"estado_lote": "VENDIDO", "numero_lote": "16"},
                "location": "Jalisco",
                "auction_id": multimarcas_id,
            },
        ]

        for item in multimarcas_items:
            await db.auction_items.insert_one(AuctionItem(**item).dict(by_alias=True, exclude={"id"}))
        await db.auctions.update_one({"auction_id": multimarcas_id}, {"$set": {"total_items": len(multimarcas_items)}})

    # Subasta: Cierre de Planta Pacific Aquaculture - Jueves 16 de octubre de 2025 11:00 hrs
    pacific_id = "pacific-aquaculture-2025-10-16"
    existing_pacific = await db.auctions.find_one({"auction_id": pacific_id})
    if not existing_pacific:
        pacific_auction = Auction(
            auction_id=pacific_id,
            title="Gran Subasta por Cierre de Planta Pacific Aquaculture",
            description=(
                "Presencial y por Internet | City Express Plus Ensenada. "
                "Inspecciones disponibles: Del 13 al 15 de octubre."
            ),
            reason="cierre_empresa",
            company_name="Pacific Aquaculture",
            start_date=datetime(2025, 10, 16, 11, 0),
            end_date=datetime(2025, 10, 16, 18, 0),
            status="proxima",
            location="City Express Plus Ensenada",
            state="Baja California",
            total_items=0,
            registration_fee=300.0,
        )
        await db.auctions.insert_one(pacific_auction.dict(by_alias=True, exclude={"id"}))

        base64_placeholder = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        pacific_items = [
            {
                "name": "Lote De Herramientas Manuales",
                "description": "Conjunto de herramientas manuales varias.",
                "category": "herramientas",
                "subcategory": "manuales",
                "brand": "Varias",
                "model": None,
                "year": None,
                "starting_price": 1.0,
                "current_bid": 1.0,
                "estimated_value": {"min": 1000, "max": 3000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"precio_reservado": True, "numero_lote": "Lote 2"},
                "location": "Baja California",
                "auction_id": pacific_id,
            },
            {
                "name": "Lote De Herramientas Eléctricas",
                "description": "Taladros, sierras y equipos eléctricos variados.",
                "category": "herramientas",
                "subcategory": "electricas",
                "brand": "Varias",
                "model": None,
                "year": None,
                "starting_price": 1.0,
                "current_bid": 1.0,
                "estimated_value": {"min": 3000, "max": 8000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"precio_reservado": True, "numero_lote": "Lote 4"},
                "location": "Baja California",
                "auction_id": pacific_id,
            },
            {
                "name": "Lote De Herramientas Eléctricas",
                "description": "Equipamiento eléctrico adicional: esmeriladoras, sierras orbitales.",
                "category": "herramientas",
                "subcategory": "electricas",
                "brand": "Varias",
                "model": None,
                "year": None,
                "starting_price": 1.0,
                "current_bid": 1.0,
                "estimated_value": {"min": 2500, "max": 7000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"precio_reservado": True, "numero_lote": "Lote 5"},
                "location": "Baja California",
                "auction_id": pacific_id,
            },
            {
                "name": "Soldadora Eléctrica Lincoln Electric WELD-PAK 140 HD",
                "description": "Soldadora MIG compacta para trabajos ligeros y medianos.",
                "category": "maquinaria",
                "subcategory": "soldadoras",
                "brand": "Lincoln Electric",
                "model": "WELD-PAK 140 HD",
                "year": None,
                "starting_price": 1.0,
                "current_bid": 1.0,
                "estimated_value": {"min": 8000, "max": 15000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"precio_reservado": True, "numero_lote": "SLote 6"},
                "location": "Baja California",
                "auction_id": pacific_id,
            },
            {
                "name": "Lote De Equipos Varios",
                "description": "Mezcla de equipos y accesorios para pesca/cultivo.",
                "category": "equipos",
                "subcategory": "varios",
                "brand": "Varias",
                "model": None,
                "year": None,
                "starting_price": 1.0,
                "current_bid": 1.0,
                "estimated_value": {"min": 2000, "max": 6000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"precio_reservado": True, "numero_lote": "LLote 7"},
                "location": "Baja California",
                "auction_id": pacific_id,
            },
            {
                "name": "Sierra De Mesa Ryobi RTS11",
                "description": "Sierra de mesa para cortes precisos en madera.",
                "category": "herramientas",
                "subcategory": "sierras",
                "brand": "Ryobi",
                "model": "RTS11",
                "year": None,
                "starting_price": 1.0,
                "current_bid": 1.0,
                "estimated_value": {"min": 4000, "max": 9000},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"precio_reservado": True, "numero_lote": "SLote 8"},
                "location": "Baja California",
                "auction_id": pacific_id,
            },
            {
                "name": "Lote De Herramientas Manuales",
                "description": "Conjunto adicional de herramientas manuales.",
                "category": "herramientas",
                "subcategory": "manuales",
                "brand": "Varias",
                "model": None,
                "year": None,
                "starting_price": 1.0,
                "current_bid": 1.0,
                "estimated_value": {"min": 1200, "max": 3500},
                "images": [base64_placeholder],
                "condition": "bueno",
                "mileage": None,
                "specifications": {"precio_reservado": True, "numero_lote": "LLote 9"},
                "location": "Baja California",
                "auction_id": pacific_id,
            },
        ]

        for item in pacific_items:
            await db.auction_items.insert_one(AuctionItem(**item).dict(by_alias=True, exclude={"id"}))
        await db.auctions.update_one({"auction_id": pacific_id}, {"$set": {"total_items": len(pacific_items)}})

# Auth endpoints
@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        company=user_data.company,
        password_hash=hashed_password
    )
    
    await db.users.insert_one(user.dict(by_alias=True, exclude={"id"}))
    
    # Create access token
    access_token = create_access_token(data={"sub": user.user_id})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user["user_id"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Auction endpoints
@api_router.get("/auctions", response_model=List[Auction])
async def get_auctions():
    auctions = await db.auctions.find().sort("start_date", 1).to_list(100)
    # Convert ObjectId to string
    for auction in auctions:
        if "_id" in auction:
            auction["_id"] = str(auction["_id"])
    return [Auction(**auction) for auction in auctions]

@api_router.get("/auctions/{auction_id}", response_model=Auction)
async def get_auction_detail(auction_id: str):
    auction = await db.auctions.find_one({"auction_id": auction_id})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if "_id" in auction:
        auction["_id"] = str(auction["_id"])
    return Auction(**auction)

@api_router.get("/auctions/{auction_id}/items", response_model=List[AuctionItem])
async def get_auction_items(auction_id: str):
    items = await db.auction_items.find({"auction_id": auction_id}).to_list(100)
    # Convert ObjectId to string
    for item in items:
        if "_id" in item:
            item["_id"] = str(item["_id"])
    return [AuctionItem(**item) for item in items]

@api_router.get("/items/{item_id}", response_model=AuctionItem)
async def get_item_detail(item_id: str):
    item = await db.auction_items.find_one({"item_id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if "_id" in item:
        item["_id"] = str(item["_id"])
    return AuctionItem(**item)

# Search endpoints
@api_router.get("/search/auctions")
async def search_auctions(
    category: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    query = {}
    
    if category:
        # Search in auction items and get auction_ids
        item_query = {"category": category}
        if min_price or max_price:
            price_filter = {}
            if min_price:
                price_filter["$gte"] = min_price
            if max_price:
                price_filter["$lte"] = max_price
            item_query["starting_price"] = price_filter
        
        items = await db.auction_items.find(item_query, {"auction_id": 1}).to_list(1000)
        auction_ids = list(set([item["auction_id"] for item in items]))
        query["auction_id"] = {"$in": auction_ids}
    
    if state:
        query["state"] = state
    if status:
        query["status"] = status
    
    auctions = await db.auctions.find(query).to_list(100)
    return [Auction(**auction) for auction in auctions]

# Public endpoints for auctions
@api_router.get("/auctions")
async def get_public_auctions():
    auctions = await db.auctions.find({}).to_list(100)
    return [Auction(**auction) for auction in auctions]

@api_router.get("/auctions/{auction_id}")
async def get_auction_detail(auction_id: str):
    auction = await db.auctions.find_one({"auction_id": auction_id})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return Auction(**auction)

@api_router.get("/auctions/{auction_id}/items")
async def get_auction_items(auction_id: str):
    items = await db.auction_items.find({"auction_id": auction_id}).to_list(1000)
    if not items:
        return []
    return [AuctionItem(**item) for item in items]

# User profile endpoints
@api_router.get("/user/profile", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/user/auctions")
async def get_user_auctions(current_user: User = Depends(get_current_user)):
    user_auction_ids = current_user.registered_auctions
    auctions = await db.auctions.find({"auction_id": {"$in": user_auction_ids}}).to_list(100)
    return [Auction(**auction) for auction in auctions]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_sample_data()
    await seed_custom_auctions()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()