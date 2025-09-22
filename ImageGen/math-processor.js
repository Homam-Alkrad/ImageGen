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
      
      try {
        const parsed = math.parse(option);
        let latex = parsed.toTex({parenthesis: 'keep'});
        
        latex = latex.replace(/:=/g, '=');
        
        const renderedMath = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: false
        });
        
        optionsHTML += `<div class="option ${optionClass}" data-label="${labels[index]}">${renderedMath}</div>`;
      } catch (error) {
        optionsHTML += `<div class="option ${optionClass}" data-label="${labels[index]}">${option}</div>`;
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
  let finalText = text;

  equations.forEach((equationInput, index) => {
    const expr = equationInput.value.trim();
    if (!expr) return;
    
    const equationNumber = index + 1;
    const isFraction = document.getElementById("fractionType" + equationNumber)?.checked || false;
    
    try {
      const parsed = math.parse(expr);
      let latex = parsed.toTex({parenthesis: 'keep'});
      
      latex = latex.replace(/:=/g, '=');
      
      const renderedEquation = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false
      });
      
      const equationClass = isFraction ? 'equation-fraction' : 'equation-normal';
      
      finalText = finalText.replace(`[[معادلة${equationNumber}]]`, 
        `<span class="katex-wrapper ${equationClass}" style="direction: ltr; display: inline-block; margin: 0 5px;">${renderedEquation}</span>`
      );
    } catch (error) {
      console.error("خطأ في المعادلة - math-processor.js:82" + equationNumber + ":", error);
      finalText = finalText.replace(`[[معادلة${equationNumber}]]`, 
        `<span class="error">خطأ في المعادلة ${equationNumber}</span>`
      );
    }
  });

  const optionsHTML = getOptionsHTML();
  if (optionsHTML) {
    finalText += optionsHTML;
  }

  finalText = finalText.replace(/\n/g, '<br>');

  const preview = document.getElementById("preview");
  
  // Structure the content properly - no source text above
  let previewContent = "";
  
  // Create the main content structure
  if (sourceData.sourceImage) {
    previewContent = `
      <div class="preview-main-content">
        <div class="preview-text">${finalText}</div>
        ${sourceData.sourceImage}
      </div>
    `;
  } else {
    previewContent = `<div class="preview-text">${finalText}</div>`;
  }
  
  preview.innerHTML = previewContent;
  
  const katexElements = preview.querySelectorAll('.katex');
  katexElements.forEach(eq => {
    eq.style.direction = 'ltr';
    eq.style.display = 'inline-block';
  });
}