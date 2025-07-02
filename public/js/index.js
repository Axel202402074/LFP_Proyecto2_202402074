document.addEventListener('DOMContentLoaded', () => {

    const button = document.getElementById('analyze');
    const editor = document.getElementById('editor');
    const salida = document.getElementById('salida');
    const table = document.getElementById('tokens');
    const tableError = document.getElementById('errors');
    const clear = document.getElementById('clear');
    const open = document.getElementById('open');
    const save = document.getElementById('save');

    // Limpiar el editor, salida y tablas
    clear.addEventListener('click', () => {
        editor.innerHTML = '';
        salida.innerText = '';
        table.innerHTML = '';
        tableError.innerHTML = '';
        localStorage.clear();
    });

    // Abrir archivo .cs
    open.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".cs";

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();

                reader.onload = (e) => {
                    const fileContent = e.target.result;
                    editor.innerText = fileContent;
                };

                reader.readAsText(file);
            }

            fileInput.remove();
        });

        fileInput.click();
    });

    // Guardar archivo .cs
    save.addEventListener('click', () => {
        const download = document.createElement('a');
        download.href = `data:text/plain;charset=utf-8,${encodeURIComponent(editor.innerText)}`;
        download.download = "archivo.cs";
        download.click();
    });

    // Analizar el texto
    button.addEventListener('click', async () => {
        localStorage.clear(); // Limpia errores previos

        try {
            const response = await fetch('http://localhost:3000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: editor.innerText
            });

            if (!response.ok) {
                alert("Error en el servidor al analizar el código.");
                return;
            }

            const result = await response.json();

           // Si hay errores léxicos, guarda pero NO redirijas automáticamente
if (result.errors && result.errors.length > 0) {
    localStorage.setItem('lexicalErrors', JSON.stringify(result.errors));
    alert("¡Se encontraron errores léxicos! ");
    // window.location.href = '/errors'; // <-- Elimina o comenta esta línea
    // return; // También puedes eliminar este return si quieres mostrar el resto
}

            // Mostrar tokens
            let textTable = ``;
            result.tokens.forEach((token, index) => {
                textTable += `
                    <tr>
                        <td> ${index + 1} </td>
                        <td> ${token.typeTokenString} </td>
                        <td> ${token.lexeme} </td>
                        <td> ${token.row} </td>
                        <td> ${token.column} </td>
                    </tr>
                `;
            });
            table.innerHTML = textTable;

            // Mostrar errores sintácticos (si hay)
            let textErrors = ``;
            result.syntacticErrors.forEach((error, index) => {
                textErrors += `
                    <tr>
                        <td> ${index + 1} </td>
                        <td> ${error.typeTokenString} </td>
                        <td> ${error.lexeme} </td>
                        <td> ${error.row} </td>
                        <td> ${error.column} </td>
                    </tr>
                `;
            });
            tableError.innerHTML = textErrors;

            // Colorear el editor con el resultado
            editor.innerHTML = result.colors;

            // Mostrar la traducción si no hay errores sintácticos
            if (result.syntacticErrors.length === 0) {
                salida.innerText = result.traduction;
            } else {
                alert('La entrada tiene errores sintácticos');
                localStorage.setItem('syntacticErrors', JSON.stringify(result.syntacticErrors));
            }

        } catch (error) {
            console.error("Error al analizar:", error);
            alert("No se pudo analizar el texto. Verifica la conexión con el servidor.");
        }
    });

});