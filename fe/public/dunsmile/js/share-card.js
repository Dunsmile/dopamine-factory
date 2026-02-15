(function attachDopaminShareCard() {
  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawBalls(ctx, numbers, startX, y, size, gap) {
    numbers.forEach(function drawBall(num, i) {
      var x = startX + i * (size + gap);
      var hue = 210 + (i % 6) * 18;
      var grad = ctx.createLinearGradient(x, y, x + size, y + size);
      grad.addColorStop(0, "hsl(" + hue + ", 90%, 62%)");
      grad.addColorStop(1, "hsl(" + (hue + 20) + ", 88%, 48%)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 36px 'Noto Sans KR', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(num), x + size / 2, y + size / 2 + 1);
    });
  }

  function makeDownloadName(prefix) {
    var stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return (prefix || "dopamin-share-card") + "-" + stamp + ".png";
  }

  function toBlob(canvas) {
    return new Promise(function resolveBlob(resolve) {
      if (canvas.toBlob) {
        canvas.toBlob(function onBlob(blob) {
          resolve(blob);
        }, "image/png");
        return;
      }
      resolve(null);
    });
  }

  async function download(options) {
    var opts = options || {};
    var title = opts.title || "도파민 공작소";
    var subtitle = opts.subtitle || "오늘의 결과";
    var highlight = opts.highlight || "";
    var tags = Array.isArray(opts.tags) ? opts.tags.slice(0, 5) : [];
    var numbers = Array.isArray(opts.numbers) ? opts.numbers.slice(0, 6) : [];
    var footer = opts.footer || "https://dopamine-factory.pages.dev";
    var filePrefix = opts.filePrefix || "dopamin-share-card";
    var fromColor = opts.fromColor || "#1d4ed8";
    var toColor = opts.toColor || "#7c3aed";

    var canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    var ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context unavailable");
    }

    var bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, fromColor);
    bg.addColorStop(1, toColor);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.15;
    for (var i = 0; i < 14; i += 1) {
      ctx.beginPath();
      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#f8fafc";
      ctx.arc(120 + i * 72, 80 + (i % 3) * 220, 20 + (i % 4) * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    roundedRect(ctx, 70, 70, 940, 1210, 44);
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.fill();

    ctx.fillStyle = "#111827";
    ctx.font = "700 42px 'Noto Sans KR', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("도파민 공작소", 130, 140);

    ctx.fillStyle = "#1f2937";
    ctx.font = "800 64px 'Noto Sans KR', sans-serif";
    ctx.fillText(title, 130, 230);

    ctx.fillStyle = "#4b5563";
    ctx.font = "500 34px 'Noto Sans KR', sans-serif";
    ctx.fillText(subtitle, 130, 320);

    if (highlight) {
      roundedRect(ctx, 130, 390, 820, 120, 24);
      ctx.fillStyle = "#f1f5f9";
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 48px 'Noto Sans KR', sans-serif";
      ctx.fillText(highlight, 170, 430);
    }

    if (numbers.length > 0) {
      ctx.fillStyle = "#374151";
      ctx.font = "700 30px 'Noto Sans KR', sans-serif";
      ctx.fillText("추천 번호", 130, 560);
      drawBalls(ctx, numbers, 130, 610, 110, 18);
    }

    if (tags.length > 0) {
      ctx.fillStyle = "#374151";
      ctx.font = "700 30px 'Noto Sans KR', sans-serif";
      ctx.fillText("핵심 키워드", 130, 790);

      var tagY = 840;
      tags.forEach(function eachTag(tag, idx) {
        var text = "#" + String(tag);
        var x = 130 + (idx % 2) * 390;
        var y = tagY + Math.floor(idx / 2) * 90;

        roundedRect(ctx, x, y, 340, 62, 16);
        ctx.fillStyle = "#eef2ff";
        ctx.fill();

        ctx.fillStyle = "#4338ca";
        ctx.font = "700 30px 'Noto Sans KR', sans-serif";
        ctx.fillText(text, x + 22, y + 16);
      });
    }

    ctx.fillStyle = "#6b7280";
    ctx.font = "500 24px 'Noto Sans KR', sans-serif";
    ctx.fillText("결과 생성 시각: " + new Date().toLocaleString("ko-KR"), 130, 1170);
    ctx.fillText(footer, 130, 1210);

    var blob = await toBlob(canvas);
    if (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = makeDownloadName(filePrefix);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }

    var dataUrl = canvas.toDataURL("image/png");
    var fallback = document.createElement("a");
    fallback.href = dataUrl;
    fallback.download = makeDownloadName(filePrefix);
    document.body.appendChild(fallback);
    fallback.click();
    fallback.remove();
  }

  window.DopaminShareCard = {
    download: download
  };
})();
