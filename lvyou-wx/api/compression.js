import Compressor from 'compressorjs';
// 图片压缩
const maxFileSize = 100 * 1024; // 设置最大文件大小为100KB

const compressImage = function(files){
  return new Promise((resolve, reject) => {
    const compressFiles = files.map((item) => {
      return new Promise((resolveFile, rejectFile) => {
        if (item.file.size <= maxFileSize) {
			console.log('图片小于等于100kb');
          // 如果图片大小小于等于最大文件大小，再判断图片宽高比
          const img = new Image();
          img.src = URL.createObjectURL(item.file);
          img.onload = async() => {
			if (img.width / img.height <= 0.47) {// 如果图片太大就裁剪，但不再压缩
				console.log('图片小于等于100kb-------图片太大');
				new Compressor(item.file, {
				  quality: 1,
				  width: 658,
				  height: 987,
				  resize: 'cover',
				  success(result) {
				    resolveFile(result);
				  },
				  error(err) {
				    rejectFile(err);
				  }
				})
			}else{
				console.log('图片小于等于100kb-------图片不裁剪不压缩');
				resolveFile(item.file);
			}
		  }
        } else {
		  const img = new Image();
          img.src = URL.createObjectURL(item.file);
          img.onload = async() => {
            console.log(img.width / img.height + '------' + 0.47);
            if (img.width / img.height <= 0.47) { // 如果图片太大就裁剪，这是给一个宽高比
              console.log('太大裁剪');
              new Compressor(item.file, {
                quality: 0.6,
                width: 658,
                height: 987,
                resize: 'cover',
                success(result) {
                  resolveFile(result);
                },
                error(err) {
                  rejectFile(err);
                }
              })
            } else {
			  console.log('不裁剪-----要压缩');
              new Compressor(item.file, {
                quality: 0.6,
                success(result) {
                  resolveFile(result);
                },
                error(err) {
                  rejectFile(err);
                }
              })
            }
          }
        }
      })
    })
    // 等待所有图片压缩完成后再进行上传等操作
    Promise.all(compressFiles).then((results) => {
      // 自定义文件后缀
	  const newFiles = Array.from(results).map(file => {
	    const fileFormat = (file.name).split(".");
	    const newFileName = `${Date.now()}-${Math.floor(Math.random(0,1) * 10000000)}${"."}${fileFormat[fileFormat.length - 1]}`;
	    const newFile = new File([file], newFileName, { type: file.type });
	    return newFile;
	  });
	  resolve(newFiles);
    }).catch((err) => {
      reject(err);
    });
  });
}

export {compressImage}