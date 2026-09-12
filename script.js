(function(){
  // ---------- animated star field ----------
  (function(){
    var canvas = document.getElementById("stars");
    if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var sky = document.querySelector(".sky");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var stars = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize(){
      var w = sky.offsetWidth, h = sky.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round((w * h) / 9000);
      stars = [];
      for(var i = 0; i < count; i++){
        stars.push({
          x: Math.random() * w,
          y0: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          base: Math.random() * 0.4 + 0.45,
          speed: Math.random() * 1.4 + 0.5,
          phase: Math.random() * Math.PI * 2,
          drift: Math.random() * 7 + 3
        });
      }
      draw(0);
    }

    function draw(t){
      var w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      var tt = t / 1000;
      for(var i = 0; i < stars.length; i++){
        var s = stars[i];
        var a = reduceMotion ? s.base : s.base + Math.sin(tt * s.speed + s.phase) * 0.55;
        a = Math.max(0.05, Math.min(1, a));
        var y = reduceMotion ? s.y0 : (((s.y0 - tt * s.drift) % h) + h) % h;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
        ctx.fill();
      }
    }

    function loop(t){
      draw(t);
      requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("load", resize);
    setTimeout(resize, 500);
    setTimeout(resize, 1500);
    if(!reduceMotion){
      requestAnimationFrame(loop);
    }
  })();

  // ---------- backend endpoint (Google Apps Script Web App) ----------
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbyEfWG06lkw2XqcCvpbxVr3y1cUFkfd0juOK7txGi3e8KlLFQoU6yOFauV9US9AvvKt/exec";
  var endpointReady = ENDPOINT.indexOf("__") !== 0;

  function refreshTally(){
    if(!endpointReady) return;
    fetch(ENDPOINT, { method: "GET" })
      .then(function(r){ return r.json(); })
      .then(function(res){
        var el = document.getElementById("tallyCount");
        if(el && res && typeof res.total === "number") el.textContent = res.total;
      })
      .catch(function(){});
  }
  refreshTally();

  var guests = 0;
  var guestCountEl = document.getElementById("guestCount");
  var guestsField = document.getElementById("guestsField");
  function renderGuests(){ guestCountEl.textContent = guests; }
  document.getElementById("guestPlus").addEventListener("click", function(){
    guests = Math.min(guests + 1, 20); renderGuests();
  });
  document.getElementById("guestMinus").addEventListener("click", function(){
    guests = Math.max(guests - 1, 0); renderGuests();
  });

  var radios = document.querySelectorAll("input[name=attend]");
  function syncAttendUI(){
    var yes = document.getElementById("attendYes").checked;
    guestsField.style.display = yes ? "" : "none";
  }
  radios.forEach(function(r){ r.addEventListener("change", syncAttendUI); });
  syncAttendUI();

  var form = document.getElementById("rsvpForm");
  var errEl = document.getElementById("formErr");
  var submitBtn = document.getElementById("submitBtn");
  var submitLabel = document.getElementById("submitLabel");

  form.addEventListener("submit", function(e){
    e.preventDefault();
    errEl.textContent = "";

    var name = document.getElementById("fName").value.trim();
    var contact = document.getElementById("fContact").value.trim();
    var role = document.getElementById("fRole").value;
    var attending = document.querySelector("input[name=attend]:checked").value;
    var remark = document.getElementById("fRemark").value.trim();
    var invitedBy = document.getElementById("fInvitedBy").value.trim();

    if(!name || !contact || !role){
      errEl.textContent = "请填写姓名、联络方式和身份。";
      return;
    }

    if(!endpointReady){
      errEl.textContent = "报名系统设置中，麻烦直接 WhatsApp 我们确认出席，谢谢！";
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "送出中…";

    var payload = {
      name: name,
      contact: contact,
      role: role,
      attending: attending,
      guests: attending === "是" ? guests : 0,
      remark: remark,
      invitedBy: invitedBy,
      submittedAt: new Date().toISOString()
    };

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function(r){ return r.json(); })
      .then(function(res){
        if(!res || res.ok !== true) throw new Error("submit-failed");
        showDone(attending, name);
        refreshTally();
      })
      .catch(function(){
        errEl.textContent = "暂时无法在线提交，麻烦直接 WhatsApp 我们确认出席（姓名：" + name + "，人数：" + (attending === "是" ? (guests + 1) : 0) + "），我们会尽快为您登记。";
        submitBtn.disabled = false;
        submitLabel.textContent = "确认送出 Confirm RSVP";
      });
  });

  function showDone(attending, name){
    document.getElementById("formView").hidden = true;
    var doneView = document.getElementById("doneView");
    doneView.hidden = false;
    if(attending === "否"){
      document.getElementById("doneTitle").textContent = "了解，谢谢告知";
      document.getElementById("doneSub").textContent = "很遗憾这次未能见到您，期待下一次的相聚。";
      document.getElementById("icsBtn").style.display = "none";
      doneView.querySelector(".recap").style.display = "none";
    }
  }

  document.getElementById("icsBtn").addEventListener("click", function(){
    var text = encodeURIComponent("Prominds New Chapter — Grand Opening");
    var dates = "20261003T013000Z/20261003T053000Z";
    var details = encodeURIComponent("诚挚邀请您与我们一起见证 Prominds 的全新篇章。");
    var location = encodeURIComponent("2-08-01, Tower 2, VSQ@PJCC, Jalan Utara, 46200 Petaling Jaya, Selangor");
    var url = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + text + "&dates=" + dates + "&details=" + details + "&location=" + location + "&sf=true&output=xml";
    window.open(url, "_blank", "noopener");
  });
})();
