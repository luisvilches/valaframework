class FileServices {
  upload(file: File, name: string = "null", path: string = "/") {
    let ext, filename;
    if (name === "null" || name == undefined || name == null) {
      const [extention, ...fileName] = file.name.split(".").reverse();
      filename = fileName.reverse().join(".").replaceAll(" ", "_");
      ext = extention;
    } else {
      const [extention] = file.name.split(".").reverse();
      filename = name.replaceAll(" ", "_");
      ext = extention;
    }

    const newpath = `.${path}${filename}.${ext}`;
    return new Promise(async (resolve: any, reject: any) => {
      Deno.writeFile(newpath, new Uint8Array(await file.arrayBuffer()))
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }
}

export default FileServices;
