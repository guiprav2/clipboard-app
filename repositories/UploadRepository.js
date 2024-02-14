class UploadRepository {
  upload(x, onProgress) {
    let xhr = new XMLHttpRequest();

    return [xhr, new Promise((res, rej) => {
      xhr.upload.onprogress = ev => {
        if (!ev.lengthComputable) { return }
        onProgress && onProgress((ev.loaded / ev.total) * 100);
      };

      xhr.onload = () => {
        if (xhr.status === 200) { res(JSON.parse(xhr.response)) }
        else { rej(new Error(`Fetch error: ${xhr.status}`)) }
      };

      xhr.onerror = () => rej(new Error(`Fetch error: ${xhr.status}`));

      let data = new FormData();
      data.append('file', x);
      xhr.open('POST', 'https://filet.guiprav.com/clipboard/upload');
      xhr.send(data);
    })];
  }
}

export default new UploadRepository();
