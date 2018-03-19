# admin-fileuploader

Модуль для удобной загрузки файлов и, в частности, картинок на сервер. 

###Применение:
```
<script>
    new FileUploader({
        type: "image",
        element: "image",
        url: "/file/upload",
        acceptedFiles: ["gif", "jpg", "png"],
        data: "image-input"
  });
</script>
```

###Более расширенная версия:
```
<script>
    new FileUploader({
        type: "images",
        element: "images",
        url: "/file/upload",
        acceptedFiles: ["gif", "jpg", "png"],
        data: "images-input",
        small: 150,
        large: 900,
        images: {
            dataPreview: 'images-preview',
            w: 4, h: 3
        }
    });
</script>
```

##Поля
- ```type: [images, image, files, file]``` - тип загружаемого контента. **Обязательный**<br />
- ```element: 'id-from-dom'``` - элемент, в котором будет создан дополнительный DOM. **Обязательный**<br />
- ```url: ["/url"]``` - по какой ссылку будет происходить POST-запрос на сервер. **Обязательный**<br />
- ```acceptedFiles: ["png", "pdf", "exe", "gif"]``` - список файлов, возможных для загрузки в дропзону.<br />
- ```data: 'id-from-dom'``` - элемент, в который будет загружаться информация от модуля при сохранении. **Обязательный**<br />
- ```small: 150``` - размер елемента на превью. Изначально 150.<br />
- ```large: 900``` - размер елемента в модальном окне. Изначально 900.<br />
Параметр, доступный при `type: 'images'``
```
images: {
    dataPreview: 'images-preview',
    w: 4,
    h: 3
}
```
- ```dataPreview: 'id-from-dom'``` - елемент, в который будет записывать ссылка на картинку для предсмотра.<br />
- ```w: 4, h: 3``` - отношение сторон картинки. Если не заданы, то проходит любая картинка.
