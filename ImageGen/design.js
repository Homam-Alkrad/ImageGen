let optionsVisible = false;
let sourceVisible = false;
let equationCounter = 0;

function addNewLine() {
  const textarea = document.getElementById("textInput");
  const cursorPos = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPos);
  const textAfter = textarea.value.substring(cursorPos);
  
  textarea.value = textBefore + '\n' + textAfter;
  textarea.focus();
  textarea.setSelectionRange(cursorPos + 1, cursorPos + 1);
}

function addNewEquation() {
  equationCounter++;
  const container = document.getElementById("equationsContainer");
  
  const group = document.createElement("div");
  group.className = "equation-group";
  group.id = "equationGroup" + equationCounter;
  
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-equation";
  removeBtn.innerHTML = "×";
  removeBtn.onclick = () => removeEquation(equationCounter);
  
  const label = document.createElement("div");
  label.className = "equation-label";
  label.textContent = `المعادلة رقم ${equationCounter}:`;
  
  const typeControl = document.createElement("div");
  typeControl.className = "equation-type-control";
  
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "fractionType" + equationCounter;
  checkbox.checked = false;
  
  const checkboxLabel = document.createElement("label");
  checkboxLabel.htmlFor = "fractionType" + equationCounter;
  checkboxLabel.textContent = "معادلة كسرية";
  checkboxLabel.style.cursor = "pointer";
  
  typeControl.appendChild(checkbox);
  typeControl.appendChild(checkboxLabel);
  
  const input = document.createElement("input");
  input.type = "text";
  input.id = "equation" + equationCounter;
  input.className = "equation-input";
  input.placeholder = `أدخل المعادلة (مثال: (x^2+3x+2)/(x+1) أو sin(x) + cos(y))`;
  input.dir = "ltr";
  
  group.appendChild(removeBtn);
  group.appendChild(label);
  group.appendChild(typeControl);
  group.appendChild(input);
  container.appendChild(group);
  
  const textarea = document.getElementById("textInput");
  const cursorPos = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPos);
  const textAfter = textarea.value.substring(cursorPos);
  
  textarea.value = textBefore + ` [[معادلة${equationCounter}]] ` + textAfter;
  textarea.focus();
  textarea.setSelectionRange(cursorPos + ` [[معادلة${equationCounter}]] `.length, cursorPos + ` [[معادلة${equationCounter}]] `.length);
}

function removeEquation(id) {
  const group = document.getElementById("equationGroup" + id);
  if (group) {
    group.remove();
  }
}

function toggleOptionsSection() {
  const container = document.getElementById("optionsContainer");
  optionsVisible = !optionsVisible;
  container.style.display = optionsVisible ? "block" : "none";
}

function toggleSourceSection() {
  const container = document.getElementById("sourceContainer");
  sourceVisible = !sourceVisible;
  container.style.display = sourceVisible ? "block" : "none";
}

function getSourceHTML() {
  const sourceText = document.getElementById("sourceText").value.trim();
  const sourceType = document.querySelector('input[name="sourceType"]:checked').value;
  
  if (!sourceText && sourceType === 'none') return "";
  
  let sourceImageHTML = "";
  
  // Add source image container if selected
  if (sourceType !== 'none') {
    const imageFileName = sourceType === 'naseeha' ? 'img1.png' : 'img2.png';
    
    sourceImageHTML = `
      <div class="source-image-container">
        <img src="${imageFileName}" alt="${sourceText}" class="source-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div class="source-image-placeholder" style="display: none;">IMG</div>
        <div class="source-image-label">${sourceText || (sourceType === 'naseeha' ? 'نصيحة' : 'أجنبي')}</div>
      </div>
    `;
  }
  
  return {
    sourceText: "", // No source text above the question
    sourceImage: sourceImageHTML
  };
}

function clearAll() {
  if (confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
    document.getElementById("textInput").value = "";
    document.getElementById("equationsContainer").innerHTML = "";
    document.getElementById("optionA").value = "";
    document.getElementById("optionB").value = "";
    document.getElementById("optionC").value = "";
    document.getElementById("optionD").value = "";
    document.getElementById("sourceText").value = "";
    document.getElementById("optionsContainer").style.display = "none";
    document.getElementById("sourceContainer").style.display = "none";
    document.getElementById("optionAFractionType").checked = false;
    document.getElementById("optionBFractionType").checked = false;
    document.getElementById("optionCFractionType").checked = false;
    document.getElementById("optionDFractionType").checked = false;
    
    // Reset source type to 'none'
    document.querySelector('input[name="sourceType"][value="none"]').checked = true;
    
    optionsVisible = false;
    sourceVisible = false;
    equationCounter = 0;
    document.getElementById("preview").innerHTML = '<p style="color: #888; text-align: center;">النتيجة ستظهر هنا بعد إدخال النص والمعادلات...</p>';
  }
}

function downloadImage() {
  const preview = document.getElementById("preview");
  if (!preview.innerHTML.trim() || preview.innerHTML.includes("النتيجة ستظهر هنا")) {
    alert("يرجى إنشاء المحتوى أولاً قبل التحميل");
    return;
  }
  
  // Create a temporary container for download
  const downloadContainer = document.getElementById("downloadContainer");
  downloadContainer.innerHTML = preview.innerHTML;
  downloadContainer.className = "download-container";
  
  // Replace all images with placeholders to avoid CORS issues
  const images = downloadContainer.querySelectorAll('img');
  images.forEach(img => {
    const placeholder = document.createElement('div');
    placeholder.className = 'source-image-placeholder';
    placeholder.textContent = 'IMG';
    placeholder.style.cssText = `
      width: 80px;
      height: 80px;
      background: #f0f0f0;
      border: 2px solid #999;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #666;
      margin-bottom: 8px;
    `;
    img.parentNode.replaceChild(placeholder, img);
  });
  
  setTimeout(() => {
    html2canvas(downloadContainer, {
      scale: 3,
      useCORS: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: downloadContainer.offsetWidth,
      height: downloadContainer.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      logging: false,
      ignoreElements: function(element) {
        // Skip any remaining image elements
        return element.tagName === 'IMG';
      }
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = "سؤال_مع_معادلات_" + new Date().getTime() + ".png";
      link.href = canvas.toDataURL("image/png", 1.0);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset the download container
      downloadContainer.className = "download-container download-hidden";
      downloadContainer.innerHTML = "";
    }).catch(error => {
      console.error("خطأ في تحميل الصورة: - design.js:208", error);
      alert("حدث خطأ أثناء تحميل الصورة. سيتم استخدام نص بديل للصور.");
    });
  }, 300);
}

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'Enter') {
    displayEquations();
  }
});