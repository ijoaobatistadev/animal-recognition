function getVersionMl5() {
  return ml5.version;
}

function searchToObject() {
  let pairs = window.location.search.substring(1).split('&'),
    obj = {},
    pair,
    i;
  for (i in pairs) {
    if (pairs[i] === '') continue;
    pair = pairs[i].split('=');
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return obj;
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

async function recognition() {
  const image = await imageUrlToBase64(searchToObject().image);
  $('body').append(`<img id="recognitionImage" src=${image} />`);
  const featureExtractor = await ml5.featureExtractor('MobileNet');
  const classifier = featureExtractor.classification();
  await classifier.load('/models/galo/model.json');
  const result = await classifier.classify($('#recognitionImage')[0]);
  return result;
}
