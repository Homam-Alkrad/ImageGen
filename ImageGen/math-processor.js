// Corrected Math processing function for your design.js file
function parseMathExpression(expr) {
  try {
    // Preprocess the expression to handle implicit multiplication
    let processedExpr = expr.trim();
    
    // Handle comma-separated expressions by splitting and processing each part
    if (processedExpr.includes(',')) {
      const parts = processedExpr.split(',').map(part => part.trim());
      const processedParts = parts.map(part => {
        // Handle explicit multiplication - remove * and keep implicit
        let processed = part;
        processed = processed.replace(/(\d)\s*\*\s*([a-zA-Z])/g, '$1$2'); // 5*x → 5x
        processed = processed.replace(/([a-zA-Z])\s*\*\s*(\d)/g, '$1$2'); // x*5 → x5
        processed = processed.replace(/(\w)\s*\*\s*(\w)/g, '$1$2'); // a*b → ab
        
        // Keep implicit multiplication as implicit (no dots)
        processed = processed.replace(/(\d)([a-zA-Z])/g, '$1$2'); // 5x → 5x
        processed = processed.replace(/(\d)(sin|cos|tan|log|ln|sqrt)/g, '$1$2'); // 5sin → 5sin
        processed = processed.replace(/([a-zA-Z])(\d)([a-zA-Z])/g, '$1$2$3'); // x2y → x2y
        processed = processed.replace(/([a-zA-Z])([a-zA-Z])/g, '$1$2'); // xy → xy
        
        try {
          const parsed = math.parse(processed);
          let latex = parsed.toTex({parenthesis: 'keep', implicit: 'hide'});
          // Remove any multiplication dots that might appear
          latex = latex.replace(/\\cdot/g, '');
          return latex;
        } catch (error) {
          console.warn("Could not parse part:", processed);
          return processed; // Return as-is if parsing fails
        }
      });
      
      // Join the parts back with commas
      return processedParts.join(', ');
    }
    
    // Handle explicit multiplication - remove * and keep implicit
    processedExpr = processedExpr.replace(/(\d)\s*\*\s*([a-zA-Z])/g, '$1$2'); // 5*x → 5x
    processedExpr = processedExpr.replace(/([a-zA-Z])\s*\*\s*(\d)/g, '$1$2'); // x*5 → x5
    processedExpr = processedExpr.replace(/(\w)\s*\*\s*(\w)/g, '$1$2'); // a*b → ab
    
    // Keep implicit multiplication as implicit (no dots)
    processedExpr = processedExpr.replace(/(\d)([a-zA-Z])/g, '$1$2'); // 5x → 5x (keep as is)
    processedExpr = processedExpr.replace(/(\d)(sin|cos|tan|log|ln|sqrt)/g, '$1$2'); // 5sin → 5sin
    processedExpr = processedExpr.replace(/([a-zA-Z])(\d)([a-zA-Z])/g, '$1$2$3'); // x2y → x2y
    processedExpr = processedExpr.replace(/([a-zA-Z])([a-zA-Z])/g, '$1$2'); // xy → xy
    
    const parsed = math.parse(processedExpr);
    let latex = parsed.toTex({parenthesis: 'keep', implicit: 'hide'});
    latex = latex.replace(/:=/g, '=');
    // Remove any multiplication dots
    latex = latex.replace(/\\cdot/g, '');
    return latex;
  } catch (error) {
    console.error("Error parsing expression:", error);
    // If parsing fails, try to render it as-is with KaTeX, but clean up * symbols first
    let cleaned = expr.replace(/(\d)\s*\*\s*([a-zA-Z])/g, '$1$2');
    cleaned = cleaned.replace(/([a-zA-Z])\s*\*\s*(\d)/g, '$1$2');
    cleaned = cleaned.replace(/(\w)\s*\*\s*(\w)/g, '$1$2');
    return cleaned;
  }
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
  
  let previewContent = "";
  
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