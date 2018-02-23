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

    this.files = [];
    this.el = $('#' + this.elName);

    if (this.type === 'images') {
      if (config.images.dataPreview)
        this.dataPreview = config.images.dataPreview;
    }

    if (!this.acceptedFiles)
      this.acceptedFiles = '*';
    else
      this.acceptedFiles = this.acceptedFiles.map(function (x) { return "." + x; });
    this.acceptedFiles = this.acceptedFiles.join(', ');

    const fu = this;

    // add progress, gallery and dropzone
    this.progressDiv = "<div class='progress-bar'></div>";
    const contId = this.elName + '-container';
    const containerDiv = "<div class='container' id='" + contId + "'></div>";
    const dzDiv = "<form method='post' id='myDropzone' class='dropzone'></form>";
    this.el.append(this.progressDiv, containerDiv, dzDiv);
    this.container = $('#' + contId);

    // init dropzone
    Dropzone.options.myDropzone = {
      url: this.url,
      acceptedFiles: this.acceptedFiles,
      sending: function(file, xhr, data) {
        // send filename and type
        data.append("filename", file.name);
        data.append("type", fu.type);
      },
      success: function(file, res) {
        // create new file
        const f = new File(fu.files.length, res.name, res.url, res.urlSmall, res.urlLarge, res.width, res.height, res.size);
        fu.files.push(f);
        console.log(fu.files);
        // add in html
        fu.addFile(f);
        // remove from dropzone
        $(file.previewElement).remove();
      },
      queuecomplete: function() {
        $('.dz-message').css({'display': 'block'});
      }
    };

    // make sortable items
    this.container.sortable({
      tolerance: 'pointer'
    });

    // make click for modal
    $('.item-image').on('click', function() {
      console.log('2');
      const fileEl = $(this).find('img');
      console.log(fileEl);
      const id = fileEl.attr('id');
      const file = fu.files[id];
      fu.setModalFile(file);
    });

    // $('.file-container').click(function() {
    //   console.log('1111');
    // });

    // $('.fa-check').click(() => {
    //   $('.file-container').removeClass('primary');
    //
    // });
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
      "  <div class='item-image'>" + // data-toggle='modal' data-target='#file-info-modal'
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
    this.container.append(item);
  }

  setModalFile(file) {
    console.log('1');
    // set data in modal
    $('.modal-header').text(file.name);
    const body = '.modal-body #';

    // static data
    $(body + 'file-image').attr('src', file.urlL);
    $(body + 'name').text(file.name);
    $(body + 'dimensions').text(file.width + 'x' + file.height);
    $(body + 'size').text(file.size);
    $(body + 'url').val(window.location.hostname + file.url);

    // dynamic data
    $(body + 'title').val(file.title);
    $(body + 'desc').val(file.description);
    $(body + 'year').val(file.year);
    $(body + 'author').val(file.author);

    // save changes
    $('#file-uploader-save').click(function() {
      file.title = $(body + 'title').val();
      file.description = $(body + 'desc').val();
      file.year = $(body + 'year').val();
      file.author = $(body + 'author').val();
      $('#file-info-modal').modal('hide');
    });
  }
}
