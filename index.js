const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configurar fuso horário para Brasília/São Paulo
process.env.TZ = 'America/Sao_Paulo';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Conexão com MongoDB
mongoose.connect('mongodb+srv://nox:9agos2010@cluster0.p8e2u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Função para formatar data no fuso horário de SP
function getBrasiliaTime() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// Modelo da imagem
const imageSchema = new mongoose.Schema({
  data: String,
  createdAt: { 
    type: Date,
    default: getBrasiliaTime,
    expires: 18000 // 5 horas em segundos
  }
});

const Image = mongoose.model('Image', imageSchema);

// Rota para upload de imagem
app.post('/upload', async (req, res) => {
  try {
    const { img } = req.body;
    
    if (!img) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
    }

    const image = new Image({
      data: img,
      createdAt: getBrasiliaTime()
    });

    await image.save();

    const imageUrl = `${req.protocol}://${req.get('host')}/image/${image._id}`;
    res.json({ 
      url: imageUrl,
      expiraEm: new Date(image.createdAt.getTime() + 18000000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Rota para obter imagem
app.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    res.send(`<img src="${image.data}" />`);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar imagem' });
  }
});

// Rota para upload via query parameter
app.get('/api.img', async (req, res) => {
  try {
    const { img } = req.query;
    
    if (!img) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
    }

    const image = new Image({
      data: img,
      createdAt: getBrasiliaTime()
    });

    await image.save();

    const imageUrl = `${req.protocol}://${req.get('host')}/image/${image._id}`;
    res.json({ 
      url: imageUrl,
      expiraEm: new Date(image.createdAt.getTime() + 18000000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port} - Horário de Brasília: ${getBrasiliaTime()}`);
}); 
