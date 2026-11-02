import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

try:
    from fastembed import TextEmbedding
except ImportError:
    print("Warning: fastembed not found. Please install it.")

from actian_client import ActianDBClient

# Load environment variables (API keys)
load_dotenv()

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "documents")
COLLECTION_NAME = "exportease_docs_384"
VECTOR_SIZE = 384

def ingest_documents():
    print(f"Loading documents from {DATA_DIR}...")
    
    # Ensure data directory exists
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print(f"Created '{DATA_DIR}' directory. Please add PDF or TXT files here and run again.")
        return

    # Load all PDFs and Text files in the directory
    pdf_loader = DirectoryLoader(DATA_DIR, glob="**/*.pdf", loader_cls=PyPDFLoader)
    txt_loader = DirectoryLoader(DATA_DIR, glob="**/*.txt", loader_cls=TextLoader)
    
    documents = []
    try:
        documents.extend(pdf_loader.load())
        documents.extend(txt_loader.load())
    except Exception as e:
        print(f"Error loading documents: {e}")
        return

    if not documents:
        print(f"No documents found in {DATA_DIR}. Please add some files.")
        return

    print(f"Loaded {len(documents)} documents. Splitting into chunks...")

    # Split text into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    # Initialize FastEmbed
    print("⏳ Loading embedding model: BAAI/bge-small-en...")
    try:
        embedding_model = TextEmbedding(model_name="BAAI/bge-small-en")
        
        texts = [chunk.page_content for chunk in chunks]
        metadatas = [chunk.metadata for chunk in chunks]
        
        print("Generating local embeddings...")
        embeddings_generator = embedding_model.embed(texts)
        embeddings = [list(e) for e in embeddings_generator]
        print(f"Generated {len(embeddings)} embeddings.")

        # Initialize Actian VectorAI Client
        actian = ActianDBClient(host="localhost", grpc_port=6574)
        
        # Ensure collection exists
        actian.initialize_collection(collection_name=COLLECTION_NAME, vector_size=VECTOR_SIZE)
        
        # Upsert vectors
        print("Inserting vectors into Actian DB...")
        actian.upsert_vectors(
            collection_name=COLLECTION_NAME,
            texts=texts,
            embeddings=embeddings,
            metadatas=metadatas
        )
        print(f"SUCCESS: Ingested {len(chunks)} chunks into Actian VectorAI DB (Collection: {COLLECTION_NAME}).")
    except Exception as e:
        print(f"Failed to ingest into Actian VectorAI: {e}")

if __name__ == "__main__":
    ingest_documents()
