$(document).ready(() => {
  const featureExtractor = ml5.featureExtractor('MobileNet', modelLoaded);

  const classifier = featureExtractor.classification();

  function modelLoaded() {
    console.log('Model Loaded!');
    classifier.load('../../models/galo/model.json', () => {
      console.log('Modelo treinado carregado!');
    });
  }

  console.log($('.galoA'));
  console.log($('.galoB'));

  $('#addA').click(() => {
    $.each($('.galoA'), async (i, val) => {
      await classifier.addImage($(val)[0], 'galoA');
      console.log('Adiconando imagens de treianmento...', i + 1);
    });
  });

  $('#addB').click(() => {
    $.each($('.galoB'), async (i, val) => {
      await classifier.addImage(val, 'galoB');
      console.log('Adiconando imagens de treianmento...', i + 1);
    });
  });

  $('#train').click(() => {
    classifier.train((lossValue) => {
      console.log('Loss is', lossValue);
    });
  });

  $('#recognition').click(() => {
    classifier.classify($('#recognitionImage')[0], (err, result) => {
      console.log(result);
    });
  });

  $('#save').click(() => {
    classifier.save();
  });
});
