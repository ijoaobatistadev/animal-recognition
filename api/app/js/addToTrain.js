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
  return new Promise((resolve) => {
    // Instância da rede neural
    const imagesToTrain = JSON.parse(images);
    const featureExtractor = ml5.featureExtractor('MobileNet');
    const classifier = featureExtractor.classification();

    // percorre toda estrutura de dados
    $.each(imagesToTrain.images, async (i, val) => {
      // converte as urls em imagens base64 locais
      const image = await imageUrlToBase64(val.image);
      // adicionas ao DOM
      $('body').append(
        `<img class="${val.label}" data-label="${val.label}" src=${image} />`,
      );
      // Verifica se foram todas imagens adicionadas
      if (i === imagesToTrain.images.length - 1) {
        let imagesElements = document.querySelectorAll('img');
        // percorre todas imagens locais
        imagesElements.forEach(async (element, i) => {
          // insere as imagens locais na rede neural
          await classifier.addImage(element, element.dataset.label);
          // verifica se todas imagens foram adicionadas
          if (i === imagesElements.length - 1) {
            // iniciam o treinamento da rede neural
            await classifier.train((lossValue) => {
              console.log('Loss is', lossValue);
              if (!lossValue) {
                resolve();
                classifier.save();
              }
            });
          }
        });
      }
    });
  });
}
