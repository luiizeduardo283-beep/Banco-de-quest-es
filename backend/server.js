// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// aceitar payloads maiores (images as dataURL)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// CORS aberto para dev (em produção restrinja)
app.use(cors());

// simples log de requests (útil p/ debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} - content-length: ${req.headers['content-length'] || 'n/a'}`);
  next();
});

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || null; // opcional: se definido, força esse DB
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'questions';
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error('MONGO_URI não setada. Crie backend/.env com MONGO_URI="sua_string_aqui"');
  process.exit(1);
}

// Conecta (se MONGO_DB_NAME existir, passamos através da opção dbName — útil quando URI não tem DB)
const connectOptions = {};
if (MONGO_DB_NAME) connectOptions.dbName = MONGO_DB_NAME;

mongoose.connect(MONGO_URI, connectOptions)
  .then(async () => {
    console.log('MongoDB conectado');
    try {
      const defaultDb = mongoose.connection.db && mongoose.connection.db.databaseName;
      console.log('mongoose default DB:', defaultDb || '(não disponível)');
      const client = mongoose.connection.client;
      // lista coleções do DB usado pelo mongoose (default)
      const cols = await mongoose.connection.db.listCollections().toArray();
      console.log('Collections no DB padrão:', cols.map(c => c.name));
      // se MONGO_DB_NAME foi passado, liste também nesse DB
      if (MONGO_DB_NAME) {
        const otherCols = await client.db(MONGO_DB_NAME).listCollections().toArray();
        console.log(`Collections em ${MONGO_DB_NAME}:`, otherCols.map(c => c.name));
      }
    } catch (e) {
      console.warn('Erro listando collections:', e.message);
    }
  })
  .catch(err => {
    console.error('Erro conectando ao MongoDB:', err.message);
    process.exit(1);
  });

// rota raiz
app.get('/', (req, res) => res.send('API rodando. Use /api/questions ou /api/debug'));

// Endpoint de debug — devolve DB/collections e amostra da collection configurada
app.get('/api/debug', async (req, res) => {
  try {
    const client = mongoose.connection.client;
    const defaultDb = mongoose.connection.db && mongoose.connection.db.databaseName;
    const dbNameToUse = MONGO_DB_NAME || defaultDb;
    const db = client.db(dbNameToUse);

    const colsDefault = await mongoose.connection.db.listCollections().toArray();
    const namesDefault = colsDefault.map(c => c.name);

    let sampleDocs = [];
    let sampleCount = 0;
    try {
      const coll = db.collection(COLLECTION_NAME);
      sampleDocs = await coll.find().limit(5).toArray();
      sampleCount = await coll.countDocuments();
    } catch (e) {
      sampleDocs = [];
      sampleCount = 0;
    }

    res.json({
      defaultDb,
      namesDefault,
      dbNameToUse,
      COLLECTION_NAME,
      sampleCount,
      sampleDocs
    });
  } catch (err) {
    console.error('/api/debug error', err);
    res.status(500).json({ error: err.message });
  }
});

// Schema flexível (não estrito)
const questionSchema = new mongoose.Schema({}, { strict: false });
// mantemos o model apenas por compatibilidade (não será usado para reads/writes primários aqui)
const Question = mongoose.model('Question', questionSchema, COLLECTION_NAME);

// GET todas as questões (usa explicitamente client.db(...).collection(...))
app.get('/api/questions', async (req, res) => {
  try {
    const client = mongoose.connection.client;
    const defaultDb = mongoose.connection.db && mongoose.connection.db.databaseName;
    const dbNameToUse = MONGO_DB_NAME || defaultDb;
    const db = client.db(dbNameToUse);

    const limit = Math.min(parseInt(req.query.limit) || 100, 5000);
    const docs = await db.collection(COLLECTION_NAME).find().limit(limit).toArray();
    res.json(docs);
  } catch (err) {
    console.error('/api/questions error', err);
    res.status(500).json({ error: err.message });
  }
});

// POST criar
app.post('/api/questions', async (req, res) => {
  try {
    const client = mongoose.connection.client;
    const defaultDb = mongoose.connection.db && mongoose.connection.db.databaseName;
    const dbNameToUse = MONGO_DB_NAME || defaultDb;
    const db = client.db(dbNameToUse);

    const payload = req.body || {};
    const result = await db.collection(COLLECTION_NAME).insertOne(payload);
    const created = await db.collection(COLLECTION_NAME).findOne({ _id: result.insertedId });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/questions error', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT atualizar por _id (espera ObjectId válido)
app.put('/api/questions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const client = mongoose.connection.client;
    const defaultDb = mongoose.connection.db && mongoose.connection.db.databaseName;
    const dbNameToUse = MONGO_DB_NAME || defaultDb;
    const db = client.db(dbNameToUse);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const update = req.body || {};
    if (update._id) delete update._id;

    const ObjectId = mongoose.Types.ObjectId;
    const updated = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!updated.value) return res.status(404).json({ error: 'Documento não encontrado' });
    res.json(updated.value);
  } catch (err) {
    console.error('PUT /api/questions/:id error', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE por _id
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const client = mongoose.connection.client;
    const defaultDb = mongoose.connection.db && mongoose.connection.db.databaseName;
    const dbNameToUse = MONGO_DB_NAME || defaultDb;
    const db = client.db(dbNameToUse);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const ObjectId = mongoose.Types.ObjectId;
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Documento não encontrado' });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('DELETE /api/questions/:id error', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
