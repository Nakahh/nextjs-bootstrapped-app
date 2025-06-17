const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

async function zipProject() {
  const output = fs.createWriteStream(path.resolve(__dirname, '../siqueira-campos-imoveis.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Arquivo zip criado com sucesso: siqueira-campos-imoveis.zip');
  });

  archive.on('error', function(err){
    throw err;
  });

  archive.pipe(output);

  // Adiciona a pasta do projeto inteira ao zip
  archive.directory(path.resolve(__dirname, '../siqueira-campos-imoveis'), false);

  await archive.finalize();
}

zipProject().catch(err => {
  console.error('Erro ao criar zip:', err);
});
