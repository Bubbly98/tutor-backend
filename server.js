const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


app.use('/uploads', express.static('uploads'));


const upload = multer({ dest: 'uploads/' });


const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'reviewuser',       
  password: process.env.DB_PASS || 'LillyMyLove12$',
  database: process.env.DB_NAME || 'anurmbvh_reviews' 
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database.');
});


app.post('/review', upload.single('image'), (req, res) => {
  const { name, syllabus, exam, country, comment } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  console.log('Received review:', req.body);
  console.log('Received file:', req.file);

  const sql = `
    INSERT INTO reviews (name, syllabus, exam, country, comment, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [name, syllabus, exam, country, comment, imagePath];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error saving review:', err);
      return res.status(500).json({ success: false, error: err });
    }

    console.log('✅ Review saved.');

    res.json({
      success: true,
      review: {
        name,
        syllabus,
        exam,
        country,
        comment,
        imagePreview: imagePath,
        hasImage: !!imagePath
      }
    });
  });
});


app.get('/reviews', (req, res) => {
  db.query('SELECT * FROM reviews ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('❌ Error fetching reviews:', err);
      return res.status(500).json({ success: false, error: err });
    }

    const reviews = results.map(r => ({
      ...r,
      imagePreview: r.image,
      hasImage: !!r.image
    }));

    res.json(reviews);
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
