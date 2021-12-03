// pengisian nya di data visi
const datakepengurusan = new Map();
$('.summernote').summernote({
  toolbar: [
    ['fontsize', ['fontsize']], ['fontname', ['fontname']], ['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
    ['para', ['ul', 'ol', 'paragraph']], ['height', ['height']], ['color', ['color']], ['float', ['floatLeft', 'floatRight', 'floatNone']], ['remove', ['removeMedia']], ['table', ['table']], ['insert', ['link', 'unlink', 'video', 'audio', 'hr']], ['mybutton', ['myVideo']], ['view', ['fullscreen', 'codeview']], ['help', ['help']]],
  height: (200),
})
$(function () {
  function dynamic() {
    const table_html = $('#dt_basic');
    table_html.dataTable().fnDestroy()
    const new_table = table_html.DataTable({
      "ajax": {
        "url": "<?= base_url()?>admin/kepengurusan/ajax_data/",
        "data": null,
        "type": 'POST'
      },
      "processing": true,
      "serverSide": true,
      "responsive": true,
      "lengthChange": true,
      "autoWidth": false,
      "columns": [
        { "data": null },
        { "data": "nama" },
        { "data": "slug" },
        { "data": "dari" },
        { "data": "sampai" },
        {
          // visi misi
          "data": "id", render(data, type, full, meta) {
            datakepengurusan.set(full.id, full);
            return `<button
                      class="btn btn-success btn-sm btn-gambar"
                      data-toggle="modal"
                      data-id="${full.id}"
                      data-target="#modal_detail"
                      onclick="modal_detail(this)"
                      id="btn-gambar"><i class="fas fa-eye"></i></button>`
          }, className: "nowrap"
        },
        {
          "data": "foto", render(data, type, full, meta) {
            return `<button
                      class="btn btn-success btn-sm btn-gambar"
                      data-toggle="modal"
                      data-data="${data}"
                      data-target="#gambar_modal"
                      onclick="view_gambar(this)"
                      id="btn-gambar"><i class="fas fa-eye"></i></button>`
          }, className: "nowrap"
        },
        { "data": "status_str" },
        {
          "data": "id", render(data, type, full, meta) {
            const btn_aktifkan = `
                <button class="btn btn-info btn-xs" onclick="Aktifkan('${data}')">
                  <i class="fa fa-check"></i> Aktifkan
                </button>
            `;

            const btn_lihat = `
              <a class="btn btn-secondary btn-xs" href="">
                <i class="fa fa-eye"></i> Lihat
              </a>
            `;

            const btn_ubah = `
                <button class="btn btn-primary btn-xs"onclick="Ubah('${data}')">
                  <i class="fa fa-edit"></i> Ubah
                </button>
            `;

            const btn_hapus = `
                <button class="btn btn-danger btn-xs" onclick="Hapus(${data})">
                  <i class="fa fa-trash"></i> Hapus
                </button>
            `;

            let btn = (full.status == 0) ? btn_aktifkan : '';
            btn += btn_lihat;
            btn += btn_ubah;
            btn += (full.status == 0) ? btn_hapus : '';

            return `<div class="pull-right">${btn}</div>`
          }, className: "nowrap"
        }
      ],
      order: [
        [1, 'asc']
      ],
      columnDefs: [{
        orderable: false,
        targets: [0, 7]
      }],
    });
    new_table.on('draw.dt', function () {
      var PageInfo = table_html.DataTable().page.info();
      new_table.column(0, {
        page: 'current'
      }).nodes().each(function (cell, i) {
        cell.innerHTML = i + 1 + PageInfo.start;
      });
    });
  }
  dynamic();

  $("#btn-tambah").click(() => {
    $("#tambahModalTitle").text("Tambah kepengurusan");
    $('#id').val('');
    $('#nama').val('');
    $('#dari').val('');
    $('#sampai').val('');
    $('#visi').summernote("code", "");
    $('#misi').summernote("code", "");
    $('#slug').val('');
    $('#foto').val('');
    $('#keterangan').val('');
  });

  $("#nama").keyup(function () {
    var Text = $(this).val();
    $("#slug").val(Text.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-'));
  });

  $("#fmain").submit(function (ev) {
    ev.preventDefault();
    const form = new FormData(this);
    $.LoadingOverlay("show");
    $.ajax({
      method: 'post',
      url: '<?= base_url() ?>admin/kepengurusan/' + ($("#id").val() == "" ? 'insert' : 'update'),
      data: form,
      cache: false,
      contentType: false,
      processData: false,
    }).done((data) => {
      Toast.fire({
        icon: 'success',
        title: 'Data berhasil disimpan'
      })
      dynamic();
    }).fail(($xhr) => {
      Toast.fire({
        icon: 'error',
        title: 'Data gagal disimpan'
      })
    }).always(() => {
      $.LoadingOverlay("hide");
      $('#tambahModal').modal('toggle')
    })
  });

  // hapus
  $('#OkCheck').click(() => {
    let id = $("#idCheck").val()
    $.LoadingOverlay("show");
    $.ajax({
      method: 'post',
      url: '<?= base_url() ?>admin/kepengurusan/delete',
      data: {
        id: id
      }
    }).done((data) => {
      Toast.fire({
        icon: 'success',
        title: 'Data berhasil dihapus'
      })
      dynamic();
    }).fail(($xhr) => {
      Toast.fire({
        icon: 'error',
        title: 'Data gagal dihapus'
      })
    }).always(() => {
      $('#ModalCheck').modal('toggle')
      $.LoadingOverlay("hide");
    })
  })

  $("#faktifkan").submit(function (ev) {
    ev.preventDefault();
    const form = new FormData(this);
    $.LoadingOverlay("show");
    $.ajax({
      method: 'post',
      url: '<?= base_url() ?>admin/kepengurusan/activate',
      data: form,
      cache: false,
      contentType: false,
      processData: false,
    }).done((data) => {
      Toast.fire({
        icon: 'success',
        title: 'Data berhasil disimpan'
      })
      dynamic();
    }).fail(($xhr) => {
      Toast.fire({
        icon: 'error',
        title: 'Data gagal disimpan'
      })
    }).always(() => {
      $.LoadingOverlay("hide");
      $('#modal_aktifkan').modal('toggle')
    })
  });
})

const view_gambar = (datas) => {
  $("#img-view").attr('src', `<?= base_url() ?>/files/front/kepengurusan/${datas.dataset.data}`)
}

// Click Hapus
const Hapus = (id) => {
  $("#idCheck").val(id)
  $("#LabelCheck").text('Form Hapus')
  $("#ContentCheck").text('Apakah anda yakin akan menghapus data ini?')
  $('#ModalCheck').modal('toggle')
}

// Click Ubah
const Ubah = (id) => {
  $("#tambahModalTitle").text("Ubah kepengurusan");
  $.LoadingOverlay("show");
  $.ajax({
    method: 'get',
    url: '<?= base_url() ?>admin/kepengurusan/edit',
    data: {
      id: id
    }
  }).done((data) => {
    $('#id').val(data.id);
    $('#nama').val(data.nama);
    $('#dari').val(data.dari);
    $('#sampai').val(data.sampai);
    $('#slogan').val(data.slogan);
    $('#visi').summernote("code", data.visi);
    $('#misi').summernote("code", data.misi);
    $('#slug').val(data.slug);
    $('#temp_foto').val(data.foto);
    $('#foto').val('');
    $('#keterangan').val(data.keterangan);
    $('#tambahModal').modal('toggle');
  }).fail(($xhr) => {
    Toast.fire({
      icon: 'error',
      title: 'Gagal mendapatkan Data'
    })
  }).always(() => {
    $.LoadingOverlay("hide");
  })
}

// Detail
const modal_detail = (datas) => {
  const data = datas.dataset;
  const datakep = datakepengurusan.get(data.id);
  $("#modal_detail_title").html(`Detail Kepengurusan ${datakep.nama}`);
  $("#modal_detail_body").html(`<h4>Visi:</h4>  ${datakep.visi}
                                <h4>Misi:</h4>  ${datakep.misi}
                                <h4>Slogan:</h4>  ${datakep.slogan}
                                <h4>Keterangan:</h4>  ${datakep.keterangan}
  `);
}

const Aktifkan = (id) => {
  $("#aktifkan_id").val(id)
  $('#modal_aktifkan').modal('toggle')
}