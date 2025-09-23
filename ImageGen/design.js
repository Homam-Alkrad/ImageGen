function parseMathExpression(expr) {
  try {
    let processedExpr = expr.trim();
    
    if (processedExpr.includes(',')) {
      const parts = processedExpr.split(',').map(part => part.trim());
      const processedParts = parts.map(part => {
        let processed = part;
        processed = processed.replace(/(\d)\s*\*\s*([a-zA-Z])/g, '$1$2');
        processed = processed.replace(/([a-zA-Z])\s*\*\s*(\d)/g, '$1$2');
        processed = processed.replace(/(\w)\s*\*\s*(\w)/g, '$1$2');
        processed = processed.replace(/(\d)([a-zA-Z])/g, '$1$2');
        processed = processed.replace(/(\d)(sin|cos|tan|log|ln|sqrt)/g, '$1$2');
        processed = processed.replace(/([a-zA-Z])(\d)([a-zA-Z])/g, '$1$2$3');
        processed = processed.replace(/([a-zA-Z])([a-zA-Z])/g, '$1$2');
        
        try {
          const parsed = math.parse(processed);
          let latex = parsed.toTex({parenthesis: 'keep', implicit: 'hide'});
          latex = latex.replace(/:=/g, '=');
          latex = latex.replace(/\\cdot/g, '');
          latex = convertDivisionToFractions(latex);
          return latex;
        } catch (error) {
          console.warn("Could not parse part:", processed);
          return processed;
        }
      });
      
      return processedParts.join(', ');
    }
    
    processedExpr = processedExpr.replace(/(\d)\s*\*\s*([a-zA-Z])/g, '$1$2');
    processedExpr = processedExpr.replace(/([a-zA-Z])\s*\*\s*(\d)/g, '$1$2');
    processedExpr = processedExpr.replace(/(\w)\s*\*\s*(\w)/g, '$1$2');
    processedExpr = processedExpr.replace(/(\d)([a-zA-Z])/g, '$1$2');
    processedExpr = processedExpr.replace(/(\d)(sin|cos|tan|log|ln|sqrt)/g, '$1$2');
    processedExpr = processedExpr.replace(/([a-zA-Z])(\d)([a-zA-Z])/g, '$1$2$3');
    processedExpr = processedExpr.replace(/([a-zA-Z])([a-zA-Z])/g, '$1$2');
    
    const parsed = math.parse(processedExpr);
    let latex = parsed.toTex({parenthesis: 'keep', implicit: 'hide'});
    latex = latex.replace(/:=/g, '=');
    latex = latex.replace(/\\cdot/g, '');
    latex = convertDivisionToFractions(latex);
    return latex;
  } catch (error) {
    console.error("Error parsing expression:", error);
    let cleaned = expr.replace(/(\d)\s*\*\s*([a-zA-Z])/g, '$1$2');
    cleaned = cleaned.replace(/([a-zA-Z])\s*\*\s*(\d)/g, '$1$2');
    cleaned = cleaned.replace(/(\w)\s*\*\s*(\w)/g, '$1$2');
    cleaned = cleaned.replace(/:=/g, '=');
    return cleaned;
  }
}

function convertDivisionToFractions(latex) {
  latex = latex.replace(/(\d+)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
  latex = latex.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
  latex = latex.replace(/\(([^)]+)\)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
  latex = latex.replace(/\{([^}]+)\}\s*\/\s*\{([^}]+)\}/g, '\\frac{$1}{$2}');
  latex = latex.replace(/([a-zA-Z0-9]+)\s*\/\s*\{([^}]+)\}/g, '\\frac{$1}{$2}');
  latex = latex.replace(/\{([^}]+)\}\s*\/\s*([a-zA-Z0-9]+)/g, '\\frac{$1}{$2}');
  latex = latex.replace(/([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)/g, '\\frac{$1}{$2}');
  latex = latex.replace(/([^\\]|^)(\d+)\s*\/\s*\\\left\(\s*([^)]+)\s*\\\right\)/g, '$1\\frac{$2}{$3}');
  latex = latex.replace(/([^\\]|^)\\\left\(\s*([^)]+)\s*\\\right\)\s*\/\s*(\d+)/g, '$1\\frac{$2}{$3}');
  latex = latex.replace(/([^\\]|^)\\\left\(\s*([^)]+)\s*\\\right\)\s*\/\s*\\\left\(\s*([^)]+)\s*\\\right\)/g, '$1\\frac{$2}{$3}');
  return latex;
}

let optionsVisible = false;
let sourceVisible = false;
let equationCounter = 0;
let keyboardVisible = false;
let activeInput = null;

function addNewLine() {
  const textarea = document.getElementById("textInput");
  const cursorPos = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPos);
  const textAfter = textarea.value.substring(cursorPos);
  
  textarea.value = textBefore + '\n' + textAfter;
  textarea.focus();
  textarea.setSelectionRange(cursorPos + 1, cursorPos + 1);
}

function toggleKeyboard() {
  const keyboard = document.getElementById("mathKeyboard");
  keyboardVisible = !keyboardVisible;
  keyboard.style.display = keyboardVisible ? "block" : "none";
}

function insertSymbol(symbol) {
  if (!activeInput || (!activeInput.classList.contains('equation-input') && !activeInput.classList.contains('option-input'))) {
    alert("يرجى النقر على حقل معادلة أو خيار أولاً لاستخدام لوحة المفاتيح الرياضية");
    return;
  }
  
  const cursorPos = activeInput.selectionStart;
  const textBefore = activeInput.value.substring(0, cursorPos);
  const textAfter = activeInput.value.substring(cursorPos);
  
  activeInput.value = textBefore + symbol + textAfter;
  activeInput.focus();
  activeInput.setSelectionRange(cursorPos + symbol.length, cursorPos + symbol.length);
}

function insertFraction() {
  if (!activeInput || (!activeInput.classList.contains('equation-input') && !activeInput.classList.contains('option-input'))) {
    alert("يرجى النقر على حقل معادلة أو خيار أولاً لاستخدام لوحة المفاتيح الرياضية");
    return;
  }
  
  const cursorPos = activeInput.selectionStart;
  const textBefore = activeInput.value.substring(0, cursorPos);
  const textAfter = activeInput.value.substring(cursorPos);
  
  activeInput.value = textBefore + "()/()" + textAfter;
  activeInput.focus();
  activeInput.setSelectionRange(cursorPos + 1, cursorPos + 1);
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('equation-input') || e.target.classList.contains('option-input')) {
    activeInput = e.target;
  }
});

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
  const textColor = document.querySelector('input[name="sourceTextColor"]:checked').value;
  
  let sourceImageHTML = "";
  let sourceTextHTML = "";
  
  if (sourceType !== 'none') {
    let imageURL = '';
    switch(sourceType) {
      case 'naseeha':
        imageURL = 'https://naseehaexamhub.online/ImageGen/images/Naseeha.png';
        break;
      case 'foreign':
        imageURL = 'https://naseehaexamhub.online/ImageGen/images/foreign.png';
        break;
      case 'university':
        imageURL = 'https://naseehaexamhub.online/ImageGen/images/university.png';
        break;
      case 'book':
        imageURL = 'https://naseehaexamhub.online/ImageGen/images/book.png';
        break;
    }
    
    const labelHTML = sourceText ? `<div class="source-image-label" style="color: #0744bb;">${sourceText}</div>` : '';
    
    sourceImageHTML = `
      <div class="source-image-container">
        <img src="${imageURL}" alt="source" class="source-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div class="source-image-placeholder" style="display: none;">صورة</div>
        ${labelHTML}
      </div>
    `;
  }
  
  return { sourceImageHTML, sourceTextHTML };
}

function getOptionsHTML(isForDownload = false) {
  const optionA = document.getElementById("optionA").value.trim();
  const optionB = document.getElementById("optionB").value.trim();
  const optionC = document.getElementById("optionC").value.trim();
  const optionD = document.getElementById("optionD").value.trim();
  
  if (!optionA && !optionB && !optionC && !optionD) {
    return "";
  }
  
  const layout = document.querySelector('input[name="optionsLayout"]:checked').value;
  
  let optionsHTML = `<div class="options ${layout}">`;
  
  const labels = ['a)', 'b)', 'c)', 'd)'];
  const options = [optionA, optionB, optionC, optionD];
  const optionIds = ['optionAFractionType', 'optionBFractionType', 'optionCFractionType', 'optionDFractionType'];
  
  options.forEach((option, index) => {
    if (option) {
      const isFraction = document.getElementById(optionIds[index])?.checked || false;
      const optionClass = isFraction ? 'option-fraction' : 'option-normal';
      
      // Process the option text to make colons transparent
      let processedOption = option;
      
      try {
        const latex = parseMathExpression(processedOption);
        
        const renderedMath = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: isFraction
        });
        
        // Make colons transparent in the rendered content
        const finalContent = renderedMath.replace(/:/g, '<span style="color: transparent;">:</span>');
        
        optionsHTML += `<div class="option ${optionClass}" data-label="${labels[index]}">${finalContent}</div>`;
      } catch (error) {
        console.error("Error rendering option:", error);
        try {
          const cleanedOption = processedOption.replace(/:=/g, '=');
          const renderedMath = katex.renderToString(cleanedOption, {
            throwOnError: false,
            displayMode: isFraction
          });
          
          // Make colons transparent in the rendered content
          const finalContent = renderedMath.replace(/:/g, '<span style="color: transparent;">:</span>');
          
          optionsHTML += `<div class="option ${optionClass}" data-label="${labels[index]}">${finalContent}</div>`;
        } catch (katexError) {
          const cleanedOption = processedOption.replace(/:=/g, '=');
          // Make colons transparent in plain text as well
          const finalContent = cleanedOption.replace(/:/g, '<span style="color: transparent;">:</span>');
          optionsHTML += `<div class="option ${optionClass}" data-label="${labels[index]}">${finalContent}</div>`;
        }
      }
    }
  });
  
  optionsHTML += '</div>';
  return optionsHTML;
}
function displayEquations() {
  let text = document.getElementById("textInput").value;
  const equations = document.querySelectorAll('.equation-input');

  if (!text.trim()) {
    alert("يرجى إدخال نص السؤال أولاً");
    return;
  }

  const sourceData = getSourceHTML();
  let finalText = '';

  if (sourceData.sourceImageHTML || sourceData.sourceTextHTML) {
    finalText = `
      <div class="preview-main-content">
        <div class="preview-text">
          ${sourceData.sourceTextHTML}${text}
        </div>
        ${sourceData.sourceImageHTML}
      </div>
    `;
  } else {
    finalText = text;
  }

  equations.forEach((equationInput, index) => {
    const expr = equationInput.value.trim();
    if (!expr) return;
    
    const equationNumber = index + 1;
    const isFraction = document.getElementById("fractionType" + equationNumber)?.checked || false;
    
    try {
      const latex = parseMathExpression(expr);
      
      const renderedEquation = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: isFraction
      });
      
      const equationClass = isFraction ? 'equation-fraction' : 'equation-normal';
      
      finalText = finalText.replace(`[[معادلة${equationNumber}]]`, 
        `<span class="katex-wrapper ${equationClass}" style="direction: ltr; display: inline-block; margin: 0 5px;">${renderedEquation}</span>`
      );
    } catch (error) {
      console.error("Error in equation " + equationNumber + ":", error);
      try {
        const cleanedExpr = expr.replace(/:=/g, '=');
        const renderedEquation = katex.renderToString(cleanedExpr, {
          throwOnError: false,
          displayMode: isFraction
        });
        const equationClass = isFraction ? 'equation-fraction' : 'equation-normal';
        finalText = finalText.replace(`[[معادلة${equationNumber}]]`, 
          `<span class="katex-wrapper ${equationClass}" style="direction: ltr; display: inline-block; margin: 0 5px;">${renderedEquation}</span>`
        );
      } catch (katexError) {
        const cleanedExpr = expr.replace(/:=/g, '=');
        finalText = finalText.replace(`[[معادلة${equationNumber}]]`, 
          `<span class="error">${cleanedExpr}</span>`
        );
      }
    }
  });

  const optionsHTML = getOptionsHTML();
  if (optionsHTML) {
    finalText += '<br>' + optionsHTML;
  }

  const preview = document.getElementById("preview");
  preview.innerHTML = finalText;
  
  const katexElements = preview.querySelectorAll('.katex');
  katexElements.forEach(eq => {
    eq.style.direction = 'ltr';
    eq.style.display = 'inline-block';
  });
}

function clearAll() {
  if (confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
    document.getElementById("textInput").value = "";
    document.getElementById("equationsContainer").innerHTML = "";
    
    const optionIds = ['optionA', 'optionB', 'optionC', 'optionD'];
    optionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = "";
    });
    
    const sourceTextEl = document.getElementById("sourceText");
    if (sourceTextEl) sourceTextEl.value = "";
    
    document.getElementById("optionsContainer").style.display = "none";
    document.getElementById("sourceContainer").style.display = "none";
    document.getElementById("mathKeyboard").style.display = "none";
    
    const checkboxIds = ['optionAFractionType', 'optionBFractionType', 'optionCFractionType', 'optionDFractionType'];
    checkboxIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.checked = false;
    });
    
    const noneRadio = document.querySelector('input[name="sourceType"][value="none"]');
    if (noneRadio) noneRadio.checked = true;
    
    const blackColorRadio = document.querySelector('input[name="sourceTextColor"][value="black"]');
    if (blackColorRadio) blackColorRadio.checked = true;
    
    const inlineLayoutRadio = document.querySelector('input[name="optionsLayout"][value="inline"]');
    if (inlineLayoutRadio) inlineLayoutRadio.checked = true;
    
    optionsVisible = false;
    sourceVisible = false;
    keyboardVisible = false;
    equationCounter = 0;
    activeInput = null;
    document.getElementById("preview").innerHTML = '<p style="color: #888; text-align: center;">النتيجة ستظهر هنا بعد إدخال النص والمعادلات...</p>';
  }
}

function downloadImage() {
  const preview = document.getElementById("preview");
  if (!preview.innerHTML.trim() || preview.innerHTML.includes("النتيجة ستظهر هنا")) {
    alert("يرجى إنشاء المحتوى أولاً قبل التحميل");
    return;
  }
  
  setTimeout(() => {
    html2canvas(preview, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: preview.offsetWidth,
      height: preview.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      logging: false
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = "سؤال_مع_معادلات_" + new Date().getTime() + ".png";
      link.href = canvas.toDataURL("image/png", 1.0);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(error => {
      console.error("خطأ في تحميل الصورة:", error);
      alert("حدث خطأ أثناء تحميل الصورة");
    });
  }, 500);
}

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'Enter') {
    displayEquations();
  }
});