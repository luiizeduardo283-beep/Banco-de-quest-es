// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Em produção restrinja a origem: cors({ origin: 'https://seu-front' })

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI não setada. Crie um .env com MONGO_URI="sua_string_aqui"');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => {
    console.error('Erro conectando ao MongoDB:', err.message);
    process.exit(1);
  });

// Schema flexível (aceita documentos com campos variados)
const questionSchema = new mongoose.Schema({}, { strict: false });
// Ajuste o nome da collection se for diferente (ex: 'questoes', 'questions', etc.)
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'questions';
const Question = mongoose.model('Question', questionSchema, COLLECTION_NAME);

// Endpoint: pegar todas as questões (limite opcional)
app.get('/api/questions', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const docs = await Question.find().limit(limit).lean();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
