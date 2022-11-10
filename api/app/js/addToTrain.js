function getVersionMl5() {
  return ml5.version;
}

async function imageUrlToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((onSuccess, onError) => {
    try {
      const reader = new FileReader();
      reader.onload = function () {
        onSuccess(this.result);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      onError(e);
    }
  });
}

async function addToTrain(images) {
  const imagesToTrain = JSON.parse(images);
  const featureExtractor = ml5.featureExtractor('MobileNet');
  const classifier = featureExtractor.classification();

  $.each(imagesToTrain.images, async (i, val) => {
    const image = await imageUrlToBase64(val.image);
    $('body').append(
      `<img class="${val.label}" data-label="${val.label}" src=${image} />`,
    );
    if (i === imagesToTrain.images.length - 1) {
      document.querySelectorAll('img').forEach(async (element) => {
        await classifier.addImage(element, element.dataset.label);
        console.log('Adicionando...');
        // classifier.train((lossValue) => {
        //   console.log('Loss is', lossValue);
        // });
      });
    }
  });

  return 'Adicionando imagens...';
}
