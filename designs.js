/* Kaira Villanueva - 02/2018
 * Google Udacity Front-End Development
 * Final Project - Pixel Art Maker
 */

$(function() {

    // Displays modal asking for canvas size
    $(".modal").css("display", "block");

    // LIFO stacks for redo and undo functions
    const htmlHistoryUndoStack = [];
    const htmlHistoryRedoStack = [];

    /* REDO 
     * Trigger function
     * Forwards the HTML state
     */
    function redo() {
       if (htmlHistoryRedoStack.length > 0) {
            const htmlState = htmlHistoryRedoStack.pop();
            htmlHistoryUndoStack.push(htmlState);
            $("#pixelCanvas").replaceWith(htmlState);
        }
    }

    /* UNDO 
     * Trigger function
     * Rewinds the HTML state
     */
    function undo() {
        if (htmlHistoryUndoStack.length > 0) {
            const htmlState = htmlHistoryUndoStack.pop();
            htmlHistoryRedoStack.push(htmlState);
            $("#pixelCanvas").replaceWith(htmlState);
        }
    }

    /* STORE HTML STATE 
     * Helper function
     * Stores html states based on events
     */
    function storeHTMLstate() {
        const htmlState = $(".pixelArt").html();
        htmlHistoryUndoStack.push(htmlState);
    }


    /* DRAW
     * Trigger function
     * Changes color of each cell to picked color
     */
    function draw() {
        $("body").css("cursor", "url(images/draw.png), auto");
        let color = pickColor();
        let startDraw = false;
        let shouldStoreHTML = false;
        $("td").mousedown(function() {
            if (configurationStates.isDraw) {
                color = pickColor();
                startDraw = true;
                shouldStoreHTML = true;
            }
        });
        $(document).mouseup(function() {
            startDraw = false;
            if (shouldStoreHTML) {
                storeHTMLstate();
                shouldStoreHTML = false;
            }            
        })
        $("td").mousemove(function() {
            if (startDraw === false) return;
            $(this).css("background-color", color);
        });
    }

    /* ERASE
     * Trigger function
     * Changes color of each cell to white
     */    function erase() {
        $("body").css("cursor", "url(images/erase.png), auto");
        let startErase = false;
        let shouldStoreHTML = false;
        $("td").mousedown(function() {
            if (configurationStates.isErase) {
                startErase = true;
                shouldStoreHTML = true;
            }
        });
        $(document).mouseup(function() {
            startErase = false;
            if (shouldStoreHTML) {
                storeHTMLstate();
                shouldStoreHTML = false;
            }
        });
        $("td").mousemove(function() {
            if (startErase === false) return;
            $(this).css("background-color", "white");
        });
    }

    /* FILL
     * Trigger function
     * Implements a stack-based recursive flood fill
     */
    function fill() {
        $("body").css("cursor", "url(images/fill.png), auto");
        $("td").click(function() {
            let targetColor = $(this).css("background-color");
            let replacementColor = pickColor();
            floodFill($(this), targetColor, replacementColor);
            storeHTMLstate();
        });
    };
    function floodFill(node, targetColor, replacementColor) {
        if (configurationStates.isFill) {
             //  1. If target-color is equal to replacement-color, return.
            if (targetColor === replacementColor) {
                return;
            }

            //  2. If the color of node is not equal to target-color, return.
            let nodeColor = node.css("background-color");
            if (nodeColor != targetColor) {
                return;
            }

            //  3. Set the color of node to replacement-color.
            node.css("background-color", replacementColor);
            let nodeIndex = node.index();

            //  4. Perform Flood-fill 
            //  (one step to the south of node, target-color, replacement-color).
            let nodeDown = node.parent().next().children("td:eq(" + nodeIndex + ")");
            floodFill(nodeDown, targetColor, replacementColor);
            //   4. Perform Flood-fill 
            //  (one step to the north of node, target-color, replacement-color).
            let nodeUp = node.parent().prev().children("td:eq(" + nodeIndex + ")");
            floodFill(nodeUp, targetColor, replacementColor);
            //   4. Perform Flood-fill 
            //  (one step to the west of node, target-color, replacement-color).
            floodFill(node.next(), targetColor, replacementColor);
            //   4. Perform Flood-fill 
            //   (one step to the east of node, target-color, replacement-color).
            floodFill(node.prev(), targetColor, replacementColor);

            //   5. Return
            return;
        } else {
            return;
        }
    }

    /* MAKE GRID
     * Helper function
     * Creates grid based on size
     */
    function makeGrid(size) {
        console.log(size);
        let width = $(window).width() / 20;
        let height = $(window).height() / 13;
        if (size == "smallCanvas") {
            width = width / 2.5;
            height = height / 2.5;
        } else if (size == "mediumCanvas") {
            width = width / 1.5;
            height = height / 1.5;
        } 
        for (let row = 1; row <= height; row++) {
            $('#pixelCanvas').append('<tr></tr>');
        }
        for (let col = 1; col <= width; col++) {
            $('tr').append('<td></td>');
        }
        $(".modal").css("display", "none");
        storeHTMLstate();
    };

    
    /* SAVE
     * Trigger function
     * Uses html2canvas.js to save an image
     */
    function save() {
        $("td").css("border", "none");
        $("tr").css("border", "none");
        html2canvas($('.pixelArt').get(0)).then( function (canvas) {
            let pixelDownload = document.createElement("a");
            pixelDownload.href = canvas.toDataURL();
            pixelDownload.download = "pixelart"; 
            document.body.appendChild(pixelDownload);
            pixelDownload.click(); 
            $("td").css("border", "1px solid black");
            $("tr").css("border", "1px solid black");
        });
    }


    /* HEX TO RGB
     * Helper function
     * Converts color picker hex values to rgb
     */
    function hexTorgb(hex) {
        const red   = "0x" + hex[1] + hex[2] | 0;
        const blue  = "0x" + hex[3] + hex[4] | 0;
        const green = "0x" + hex[5] + hex[6] | 0;
        let color = "rgb(" + red + ", " + blue + ", " + green + ")";
        return color;
    }

    /* PICK COLOR
     * Helper function
     * HTML color picker for draw and fill
     */
    function pickColor() {
        let color = $("#colorPicker").val();
        return hexTorgb(color);
    }

    /* TRIGGER STATES
     * Boolean Object
     * Used for activating trigger states
     */
    let configurationStates = {
        isUndo:  false,
        isRedo:  false,
        isDraw:  false,
        isFill:  false,
        isErase: false,
        isSave:  false
    };

    /* TRIGGER EVENTS
     * Uses trigger states to contain callbacks
     * Calls the appropriate event per selector
     */
    $("#undo").click(function() {
        Object.keys(configurationStates)
            .forEach(i => configurationStates[i] = false);
        configurationStates.isUndo = true;
        undo();
    });
    $("#redo").click(function() {
        Object.keys(configurationStates)
            .forEach(i => configurationStates[i] = false);
        configurationStates.isRedo = true;
        redo();
    });
    $("#draw").click(function() {
        Object.keys(configurationStates)
            .forEach(i => configurationStates[i] = false);
        configurationStates.isDraw = true;
        draw();
    });
    $("#fill").click(function() {
        Object.keys(configurationStates)
            .forEach(i => configurationStates[i] = false);
        configurationStates.isFill = true;
        fill();
    });
    $("#erase").click(function() {
        Object.keys(configurationStates)
            .forEach(i => configurationStates[i] = false);
        configurationStates.isErase = true;
        erase();
    });
    $("#save").click(function() {
        Object.keys(configurationStates)
            .forEach(i => configurationStates[i] = false);
        configurationStates.isSave = true;
        save();
    });
    $("#size").change(function(){
        makeGrid($(this).val());
        $(this).attr("disabled", "disabled");
    });


});