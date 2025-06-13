const urlAPI = "https://script.google.com/macros/s/AKfycbz6Ua9LYQikcgL8OcT3CkEcxfxQNFctPZ1fg5dDP6WTRQEZpvklObLufFFx2a-XBeruYw/exec"; //จุดที่ 1 link webapp จาก appscript

$(document).ready(function() {
  const liffId = "2000143615-yk0LA09G";   //จุดที่ 2 เปลี่ยนค่า LIFF ID
  initializeLiff(liffId);
});

function initializeLiff(liffId) {
  liff
    .init({
      liffId: liffId, withLoginOnExternalBrowser: true
    })
    .then(async () => {
      if (!liff.isInClient() && !liff.isLoggedIn()) {
        window.alert("กรุณาเข้าสู่ระบบบัญชี LINE ของคุณ");
        const destinationUrl = window.location.href;
        liff.login({ redirectUri: destinationUrl });
      }
      const urlParms = new URLSearchParams(window.location.search)
      id = urlParms.get('id')

      await reloadData(id)
      await Dropdown()
      sessionStorage.setItem('idProduct', JSON.stringify(id));

      liff.getProfile().then(function(profile) {
        uid = profile.userId;
        uname = profile.displayName;
        picture = profile.pictureUrl;
        xos = liff.getOS();
        emailL = liff.getDecodedIDToken().email;
      })
    })
    .catch((err) => {
      console.log('LIFF Initialization failed ', err);
    });
}

function sendFlexMessage(uid, uname, picture, name, name1, name2, name3) {
  const flexMessage = {
    type: "flex",
    altText: "บันทึกค่าส่วนกลางสำเร็จ",
    contents: {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "" + picture,
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "action": {
          "type": "uri",
          "uri": "https://liff.line.me/2000143615-7xXDlXpx"
        }
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "💴 บันทึกส่วนกลางสำเร็จ",
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "box",
            "layout": "vertical",
            "margin": "lg",
            "spacing": "sm",
            "contents": [
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "วันที่ : ",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 2
                  },
                  {
                    "type": "text",
                    "text": "" + new Date(),
                    "wrap": true,
                    "color": "#666666",
                    "size": "xs",
                    "flex": 5
                  }
                ]
              },
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "ชื่อไลน์ : ",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 2
                  },
                  {
                    "type": "text",
                    "text": "" + uname,
                    "wrap": true,
                    "color": "#666666",
                    "size": "xs",
                    "flex": 5
                  }
                ]
              },
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "Uid : ",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 2
                  },
                  {
                    "type": "text",
                    "text": "" + uid,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5
                  }
                ]
              },
              {
                "type": "separator"
              },
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "🤵‍♂️ ชื่อ : ",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "wrap": true,
                    "flex": 3,
                    "margin": "md",
                    "gravity": "center"
                  },
                  {
                    "type": "text",
                    "text": "" + name,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5,
                    "align": "end",
                    "gravity": "center"
                  }
                ]
              },
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "🏡 บ้านเลขที่ : ",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "wrap": true,
                    "flex": 3,
                    "margin": "md",
                    "gravity": "center"
                  },
                  {
                    "type": "text",
                    "text": "" + name1,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5,
                    "align": "end",
                    "gravity": "center"
                  }
                ]
              },
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "📆 เดือน : ",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "wrap": true,
                    "flex": 3,
                    "margin": "md",
                    "gravity": "center"
                  },
                  {
                    "type": "text",
                    "text": "" + name2,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5,
                    "align": "end",
                    "gravity": "center"
                  }
                ]
              },
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "🗓 ปี : ",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "wrap": true,
                    "flex": 3,
                    "margin": "md",
                    "gravity": "center"
                  },
                  {
                    "type": "text",
                    "text": "" + name3,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5,
                    "align": "end",
                    "gravity": "center"
                  }
                ]
              },
              {
                "type": "separator"
              },
              {
                "type": "text",
                "text": " ",
                "wrap": true,
                "size": "xs",
                "color": "#8C8C8C",
                "contents": [
                  {
                    "type": "span",
                    "text": "โปรดตรวจสอบข้อมูลของท่านเพื่อความถูกต้อง"
                  }
                ]
              },
              {
                "type": "text",
                "text": " ",
                "wrap": true,
                "size": "xs",
                "color": "#8C8C8C",
                "contents": [
                  {
                    "type": "span",
                    "text": "ถ้าข้อมูลไม่ถูกต้องติดต่อ : แอดมิน ทันที"
                  }
                ]
              },
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "style": "primary",
            "height": "sm",
            "action": {
              "type": "uri",
              "label": "ตรวจสอบข้อมูล",
              "uri": "https://liff.line.me/2000143615-7xXDlXpx"
            }
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [],
            "margin": "sm"
          }
        ],
        "flex": 0
      }
    }
  };

  liff
    .sendMessages([flexMessage])
    .then(() => console.log("FlexMessage sent to", uid))
    .catch((err) => console.error("Error sending FlexMessage:", err));
}

/**ป้องกันการ submit หน้าว่าง */
function preventFormSubmit() {
  var forms = document.querySelectorAll("form");
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener("submit", function(event) {
      event.preventDefault();
    });
  }
}
window.addEventListener("load", preventFormSubmit);

/** โหลดข้อมูลครุภัณฑ์ */
async function reloadData(id) {
  Swal.fire({
    title: 'กำลังโหลดข้อมูล',
    html: 'กรุณารอสักครู่ <strong></strong> วินาที.',
    timer: 5000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading()
      const b = Swal.getHtmlContainer().querySelector('strong')
      timerInterval = setInterval(() => {
        b.textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
      }, 100)
    },
    willClose: () => {
      clearInterval(timerInterval)
    }
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log('I was closed by the timer')
    }
  })

  const obj = {};
  obj.uid = id
  const formData = JSON.stringify(obj);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${urlAPI}?action=loadDataRegister`,
    headers: {},
    data: formData,
    mode: 'no-cors',
  };

  axios
    .request(config)
    .then((response) => {
      const msgResponse = response.data;
      const datareturn = msgResponse.data.split(",")

      if (msgResponse.msg == "SUCCESS") {
        $('#databox').removeClass('d-none');
        $("#picdataRe").attr("src", datareturn[9]);
        $("#idR").html(idR)
        $("#nameR").html(nameR)
        $("#detailR").html(detailR)
      } else {
        Swal.fire({
          title: 'ค้นหาข้อมูมลไม่สำเร็จ',
          text: `${msgResponse.msg}`,
          icon: 'error',
          showCancelButton: false,
          confirmButtonColor: '#d33',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            // liff.closeWindow()
          }
        })
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

//ข้อมูลใน dropdown ส่วนแจ้งซ่อม  รายชื่อ/อีเมล
async function Dropdown() {
  try {
    $.ajax({
      url: `${urlAPI}?type=namelist`,
      type: 'GET',
      dataType: 'json', // added data type
      success: function(res) {
        dropdownListlevel(res)
      }
    });
  } catch (error) {
    console.error(error);
  }
}

/** เครดิต อ.เก๋ */
function getAllElmForm(data) {
  const name = document.getElementById("name").value;
  const name1 = document.getElementById("name1").value;
  const name2 = document.getElementById("name2").value;
  const name3 = document.getElementById("name3").value;

  Swal.fire({
    title: 'กำลังบันทึกข้อมูล',
    html: 'โปรดรอสักครู่ <strong></strong> วินาที.',
    timer: 10000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading()
      const b = Swal.getHtmlContainer().querySelector('strong')
      timerInterval = setInterval(() => {
        b.textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
      }, 100)
    },
    willClose: () => {
      clearInterval(timerInterval)
    }
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log('I was closed by the timer')
    }
  })

  const form = document.getElementById("user_form");

  $("#btn_1").hide();
  $("#btn_2").show();
  var obj = {};
  var data = new FormData();

  var all = document.querySelectorAll(
    "#user_form input, #user_form select, #user_form textarea"
  );

  for (let field of all) {
    if (field.type != "button" && field.type != "submit") {
      if (field.type == "radio" || field.type == "checkbox") {
        if (field.checked) {
          data.append(field.name, field.value);
        }
      } else {
        data.append(field.name, field.value);
      }
    }
  }
  for (let [key, val] of data.entries()) {
    obj[key] = val;
  }

  obj.imageFile = document.getElementById("picdata").src
  obj.uid = uid
  const formData = JSON.stringify(obj);
  console.log(formData)

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${urlAPI}?action=saveDataNew`,
    headers: {},
    data: formData,
    mode: 'no-cors',
  };

  axios
    .request(config)
    .then((response) => {
      const msgResponse = response.data;

      if (msgResponse.msg == "SUCCESS") {
        $("#btn_2").hide();
        $("#btn_1").show();
        $('#picdata').hide()
        $("#picdata").attr("src", "")
        $("#file_input_help").html("")
        document.getElementById("user_form").reset();
        document
          .getElementsByClassName("needs-validation")[0]
          .classList.remove("was-validated");

        sendFlexMessage(uid, uname, picture, name, name1, name2, name3);

        Swal.fire({
          title: 'ขอบคุณที่จ่ายค่าส่วนกลาง',
          text: "บันทึกข้อมูลเรียบร้อย",
          icon: 'success',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'ตกลง'
        }).then(async (result) => {
          if (result.isConfirmed) {
            reloadData(msgResponse.id)
            liff.closeWindow()
          }
        })
      } else {
        $("#btn_2").hide();
        $("#btn_1").show();
        $('#picdata').hide()
        $("#picdata").attr("src", "")
        $("#file_input_help").html("")
        document
          .getElementsByClassName("needs-validation")[0]
          .classList.remove("was-validated");

        Swal.fire({
          title: 'บันทึกไม่สำเร็จ',
          text: `${msgResponse.msg}`,
          icon: 'error',
          showCancelButton: false,
          confirmButtonColor: '#d33',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            //liff.closeWindow()
          }
        })
      }
    })
}

/** ส่วนเพิ่มเติมในระบบ */
// 1. สำหรับ upload รูปขึ้นระบบ
let imgupload = document.getElementById('file_image');
imgupload.addEventListener('change', function(e) {

  if (e.target.files[0]) {
    document.getElementById('picdata').style.display = 'block'

    let imageVal = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.onload = function(event) {
        // This line is dynamically creating a canvas element
        const canvas = document.createElement("canvas");

        let url = canvas.toDataURL(imageVal.type);
        // console.log(url)
        // document.getElementById("picdata").src = url;
      }
      img.src = e.target.result;
    }
    reader.readAsDataURL(imageVal);
  } else {
    document.getElementById("picdata").src = "";
  }
});
//ตรวจสอบขนาดไฟล์อัพโหลดและแสดงรูปภาพ อ.รองหลวง
function fileValidation() {
  var fileInput = document.querySelector("#file_image");
  //    console.log(fileInput)
  var filePath = fileInput.value;
  //    console.log(filePath)
  var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;

  var iConvert = (fileInput.files[0].size / (1024 * 1024)).toFixed(2);
  let txt = "ขนาดไฟล์: " + iConvert + " MB <br/>";
  $("#file_input_help").html("")
  if (fileInput.files[0].size > 3 * 1048576) {
    document.getElementById('picdata').style.display = 'none'
    Swal.fire({
      position: 'top',
      icon: 'info',
      title: 'คำเตือน !',
      text: 'ขนาดไฟล์ต้องไม่เกิน 3 mb',
      confirmButtonColor: '#000',
      confirmButtonText: 'ตกลง!'
    })

    fileInput.value = ''

  } else {


    if (!allowedExtensions.exec(filePath)) {

      Swal.fire({
        position: 'top',
        icon: 'error',
        title: 'กรุณาแนบไฟล์ภาพเท่านั้น!!',
        showConfirmButton: false,
        timer: 1500
      })
      fileInput.value = '';

      return false;
    }
    else {
      $('#picdata').removeClass('d-none')
      $("#file_input_help").html(txt)
      //Image preview
      if (fileInput.files && fileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('picdata').src = e.target.result
        };
        reader.readAsDataURL(fileInput.files[0]);
        console.log(fileInput.files[0])
      }
    }
  }
}


(function() {
  "use strict";

  var forms = document.querySelectorAll(".needs-validation");

  Array.prototype.slice.call(forms).forEach(function(form) {
    form.addEventListener(
      "submit",
      function(event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          showError("โปรดกรอกข้อมูลให้ครบ");
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

/** ฟังก์ชั่นแสดงข้อความเมื่อ Error (ใช้ SweetAlert2) */
function showError(e) {
  Swal.fire({
    title: e,
    icon: "warning",
    confirmButtonText: "ตกลง",
  });
}

// เพิ่มฟังก์ชัน validateForm และ checkFormValidity
function validateForm(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const name1 = document.getElementById('name1').value;
  const name2 = document.getElementById('name2').value;
  const name3 = document.getElementById('name3').value;
  const file_image = document.getElementById('file_image').value;
  const name4 = document.querySelector('input[name="name4"]:checked');

  if (name && name1 && name2 && name3 && file_image && name4) {
    document.getElementById('btn_1').disabled = false;
    document.getElementById('user_form').submit();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลยังไม่ครบ',
      text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    });
  }
}

document.getElementById('name').addEventListener('input', checkFormValidity);
document.getElementById('name1').addEventListener('input', checkFormValidity);
document.getElementById('name2').addEventListener('change', checkFormValidity);
document.getElementById('name3').addEventListener('change', checkFormValidity);
document.getElementById('file_image').addEventListener('change', checkFormValidity);
document.querySelectorAll('input[name="name4"]').forEach(radio => {
  radio.addEventListener('change', checkFormValidity);
});


function checkFormValidity() {
  const name = document.getElementById('name').value;
  const name1 = document.getElementById('name1').value;
  const name2 = document.getElementById('name2').value;
  const name3 = document.getElementById('name3').value;
  const file_image = document.getElementById('file_image').value;
  const name4 = document.querySelector('input[name="name4"]:checked');

  if (name && name1 && name2 && name3 && file_image && name4) {
    document.getElementById('btn_1').disabled = false;
  } else {
    document.getElementById('btn_1').disabled = true;
  }
}