class File {
  constructor(id, name, url, urlS, urlL, width, height, size) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.urlS = urlS;
    this.urlL = urlL;
    this.width = width;
    this.height = height;
    this.size = size;

    this.title = name.substr(0, name.lastIndexOf('.'));
    this.description = '';
    this.year = 0;
    this.author = '';
  }
}

class FileUploader {
  constructor(config) {
    // init values
    this.type = config.type;
    this.elName = config.element;
    this.url = config.url;
    this.acceptedFiles = config.acceptedFiles;
    this.dataInput = config.data;
    this.small = config.small;
    this.large = config.large;

    this.files = [];
    this.el = $('#' + this.elName);

    if (this.type === 'images') {
      const ci = config.images;
      if (ci.dataPreview)
        this.dataPreview = ci.dataPreview;
      if (ci.w && ci.h) {
        this.w = ci.w;
        this.h = ci.h;
      }
    }

    if (!this.acceptedFiles)
      this.acceptedFiles = '*';
    else
      this.acceptedFiles = this.acceptedFiles.map(function (x) { return "." + x; });
    this.acceptedFiles = this.acceptedFiles.join(', ');

    const fu = this;

    // add progress, gallery, dropzone and modal
    const modalDOM = [
        '<div id="file-info-modal" role="dialog" class="modal fade">\n' +
        '  <div class="modal-dialog">\n' +
        '    <div class="modal-content">\n' +
        '      <div class="modal-header"></div>\n' +
        '      <div class="modal-body form-horizontal"><img id="file-image" class="block-center"/>\n' +
        '        <div class="info">\n' +
        '          <div class="form-group">\n' +
        '            <label for="name" class="col-md-2">File name:</label>\n' +
        '            <label id="name" class="col-md-8"></label>\n' +
        '          </div>\n' +
        '          <div class="form-group">\n' +
        '            <label for="dimensions" class="col-md-2">File dimensions:</label>\n' +
        '            <label id="dimensions" class="col-md-8"></label>\n' +
        '          </div>\n' +
        '          <div class="form-group">\n' +
        '            <label for="size" class="col-md-2">File size:</label>\n' +
        '            <label id="size" class="col-md-8"></label>\n' +
        '          </div>\n' +
        '          <div class="form-group">\n' +
        '            <label for="url">URL:</label>\n' +
        '            <input id="url" type="text" readonly="readonly" class="form-control"/>\n' +
        '          </div>\n' +
        '          <div class="form-group">\n' +
        '            <label for="title">Title:</label>\n' +
        '            <input id="title" type="text" class="form-control"/>\n' +
        '          </div>\n' +
        '          <div class="form-group">\n' +
        '            <label for="desc">Description:</label>\n' +
        '            <input id="desc" type="text" class="form-control"/>\n' +
        '          </div>\n' +
        '          <div class="form-group">\n' +
        '            <label for="year">Year:</label>\n' +
        '            <input id="year" type="text" class="form-control"/>\n' +
        '          </div>\n' +
        '          <div class="form-group">\n' +
        '            <label for="author">Author:</label>\n' +
        '            <input id="author" type="text" class="form-control"/>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      </div>\n' +
        '      <div class="modal-footer">\n' +
        '        <button id="file-uploader-save" class="btn btn-success">Save</button>\n' +
        '        <button data-dismiss="modal" class="btn">Close</button>\n' +
        '      </div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</div>'
    ];
    this.progressDiv = "<div class='progress-bar'></div>";
    const contId = this.elName + '-container';
    const containerDiv = "<div class='container' id='" + contId + "'></div>";
    const dzId = this.elName + '-dropzone';
    const dzDiv = "<form method='post' id=" + dzId + " class='dropzone'></form>";
    const saveButton = '<button id="save-data" type="button">SAVE</button>';
    this.el.append(this.progressDiv, containerDiv, dzDiv, modalDOM[0], saveButton);
    this.container = $('#' + contId);

    // init dropzone
    const myDropzone = new Dropzone('#' + dzId, {
      url: this.url,
      acceptedFiles: this.acceptedFiles,
      maxFiles: (this.type === 'image' || this.type === 'file') ? 1 : null,
      sending: (file, xhr, data) => {
        // send filename and type
        console.log('before sending');
        data.append("filename", file.name);
        data.append("type", fu.type);
        data.append("small", fu.small);
        data.append("large", fu.large);
        console.log('after sending');
      },
      success: (file, res) => {
        // create new file
        const f = new File(fu.files.length, res.name, res.url, res.urlSmall, res.urlLarge, res.width, res.height, res.size);
        fu.files.push(f);
        console.log(fu.files);
        // add in html
        fu.addFile(f);
        // remove from dropzone
        $(file.previewElement).remove();
      },
      completemultiple: () => {
        $('.dz-message').css({'display': 'block'});
      },
      maxfilesexceeded: (file) => {
        // if there must by only one file, delete others
        myDropzone.removeAllFiles();
        myDropzone.addFile(file);
      },
      init: function() {
        this.on("thumbnail", function(file) {
          // check file dimension
          if (fu.w && fu.h) {
            if (Math.abs(file.width * fu.h - file.height * fu.w) !== 0) {
              this.removeFile(file);
              alert('Неправильное соотношение сторон!');
              $('.dz-message').css({'display': 'block'});
            }
          }
        });
      }
    });

    // make sortable items
    this.container.sortable({
      tolerance: 'pointer'
    });

    this.setListeners();

    $('#save-data').click(() => this.saveData());
  }

  addFile(file){
    const check = this.dataPreview ?
      "    <i class='fa fa-check' title='Pick as primary'></i>" : "";
    const control =
      "  <div class='item-control'>" +
      check +
      "    <i class='fa fa-times' title='Delete file'></i>" +
      "  </div>";
    const item =
      "<div class='file-container'>" +
       control+
      "  <div class='item-image' data-toggle='modal' data-target='#file-info-modal'>" +
      "    <img src=" + file.urlS + " id='" + file.id + "'>" +
      "  </div>" +
      "</div>";

    /*
    How it looks

    <div class='file-container' data-toggle='modal' data-target='#myModal'"
      <div class='item-control'>
        <i class='fa fa-check' title='Pick as primary'></i>
        <i class='fa fa-times' title='Delete file'></i>
      </div>
      <div class='item-image'>
        <img src="">
      </div>
    </div>

     */
    if (this.type === 'image' || this.type === 'file')
      this.container.empty();
    this.container.append(item);

    this.setListeners();
  }

  setModalFile(file) {
    // set data in modal
    $('.modal-header').text(file.name);
    const body = '.modal-body #';

    // static data
    $(body + 'file-image').attr('src', file.urlL);
    $(body + 'name').text(file.name);
    let d;
    if (this.type === 'images' || this.type === 'image')
      d = file.width + 'x' + file.height;
    else
      d = '-----';
    $(body + 'dimensions').text(d);
    $(body + 'size').text(file.size);
    $(body + 'url').val(window.location.hostname + file.url);

    // dynamic data
    $(body + 'title').val(file.title);
    $(body + 'desc').val(file.description);
    $(body + 'year').val(file.year);
    $(body + 'author').val(file.author);

    // save changes
    $('#file-uploader-save').click(() => {
      file.title = $(body + 'title').val();
      file.description = $(body + 'desc').val();
      file.year = $(body + 'year').val();
      file.author = $(body + 'author').val();
      $('#file-info-modal').modal('hide');
    });
  }

  setListeners() {
    // make click for modal
    const fu = this;
    $('.file-container > .item-image').click(function() {
      const fileEl = $(this).find('img');
      const id = fileEl.attr('id');
      const file = fu.files[id];
      fu.setModalFile(file);
    });

    // make picture preview
    $('.file-container > .item-control > .fa-check').click(function() {
      $('.file-container').removeClass('preview');
      $(this).parents('.file-container').addClass('preview');
    });

    // delete item
    $('.file-container > .item-control > .fa-times').click(function () {
      $(this).parents('.file-container').remove();
    });

    // make first image preview
    if (this.files.length === 1) {
      if (this.dataPreview) {
        $('.file-container').addClass('preview');
      }
    }
  }

  saveData() {
    // save general data
    let data = [];
    const fu = this;
    $('.file-container').each(function (i, item) {
      console.log(item);
      const ind = $(item).find('img').attr('id');
      data.push(fu.files[ind]);
    });
    $('#' + this.dataInput).val(JSON.stringify(data));

    // save preview
    if (this.dataPreview) {
      const id = $('.preview').find('img').attr('id');
      const previewUrl = this.files[id].url;
      $('#' + this.dataPreview).val(previewUrl);
    }
  }
}
