import fs from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const [
  inputPath = 'test_app.log',
  outputPath = 'test_app_indexed.log',
] = process.argv.slice(2);

const wordCounter = new Transform({
  readableObjectMode: false,
  writableObjectMode: false,
  transform(chunk, encoding, callback) {
    // Разделять входные данные на отдельные слова, разделенные разделителем (пробел, символ новой строки)
    const text = chunk.toString('utf8');
    const words = text.split(/\s+/);
    // Фильтровать не-текстовые символы (например, ',')
    const filteredWords = words.filter((word) => word.trim() !== '');
    // Индексировать текст в вектор - массив чисел. Позиция в массиве представляет порядок всех входных слов, отсортированных в алфавитном порядке. Значение - это количество появлений определенного слова в тексте.
    const index = {};
    for (const word of filteredWords) {
      if (!index[word]) {
        index[word] = 0;
      }
      index[word]++;
    }

    const result = Object.entries(index)
      .map(([word, count]) => `${word}: ${count}`)
      .join(', ');

    //  Вывести результирующий вектор в файл.
    callback(null, result);
  },
});

async function run() {
  try {
    await pipeline(
      fs.createReadStream('test_app.log', { encoding: 'utf8' }),
      wordCounter,
      fs.createWriteStream('test_app_indexed.log', {
        encoding: 'utf8',
      })
    );
    console.log('Pipeline succeeded');
  } catch (err) {
    console.error('Pipeline failed', err);
  }
}

run();
