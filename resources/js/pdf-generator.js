#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { generate } = require('@pdfme/generator');

// Get config file path from command line arguments
const configFilePath = process.argv[2];

if (!configFilePath) {
    console.error('Error: Configuration file path is required');
    process.exit(1);
}

// Function to download file from URL
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        // Handle local file URLs
        if (url.startsWith('file://') || url.startsWith('/') || /^[A-Za-z]:\\/.test(url)) {
            try {
                const localPath = url.startsWith('file://') 
                    ? url.replace('file://', '') 
                    : url;
                
                // For Windows paths with drive letters
                const normalizedPath = /^[A-Za-z]:\\/.test(localPath) 
                    ? localPath 
                    : path.normalize(localPath);
                
                // Just copy the file
                fs.copyFileSync(normalizedPath, outputPath);
                resolve(outputPath);
            } catch (err) {
                reject(new Error(`Failed to copy local file: ${err.message}`));
            }
            return;
        }
        
        // Handle HTTP/HTTPS URLs
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve(outputPath);
            });

            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => {}); // Delete the file on error
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to convert PDF buffer to base64 for @pdfme
function convertToBase64(filePath) {
    const buffer = fs.readFileSync(filePath);
    return `data:application/pdf;base64,${buffer.toString('base64')}`;
}

// Main PDF generation function
async function generatePDF() {
    try {
        const startTime = Date.now();
        
        // Read configuration
        const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
        const { templateUrl, fieldsConfig, data, outputPath } = config;

        console.log('Starting PDF generation...');
        console.log(`Template URL: ${templateUrl}`);
        console.log(`Fields config: ${JSON.stringify(fieldsConfig)}`);
        console.log(`Data: ${JSON.stringify(data)}`);

        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Download the template PDF
        const tempTemplatePath = path.join(path.dirname(outputPath), `temp_template_${Date.now()}.pdf`);
        await downloadFile(templateUrl, tempTemplatePath);
        
        // Convert template to base64
        const templateBase64 = convertToBase64(tempTemplatePath);

        // Prepare template schema for @pdfme/generator
        const template = {
            basePdf: templateBase64,
            schemas: [{}]
        };

        // Convert fields config to @pdfme schema format
        fieldsConfig.forEach(field => {
            template.schemas[0][field.name] = {
                type: field.type,
                position: {
                    x: field.position.x,
                    y: field.position.y
                },
                width: field.width,
                height: field.height,
                fontSize: field.fontSize || 12,
                fontColor: field.fontColor || '#000000',
                ...field.additionalProperties || {}
            };
        });

        console.log('Template schema prepared:', JSON.stringify(template.schemas[0]));

        // Prepare input data
        const inputs = [data];

        console.log('Generating PDF with @pdfme/generator...');

        // Generate the PDF
        const pdfBuffer = await generate({
            template,
            inputs
        });

        // Save the generated PDF
        fs.writeFileSync(outputPath, pdfBuffer);

        // Clean up temporary template file
        fs.unlinkSync(tempTemplatePath);

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        console.log(`PDF generation completed successfully in ${processingTime}ms`);
        console.log(`Output saved to: ${outputPath}`);

        // Output processing time for Laravel to capture
        console.log(JSON.stringify({
            success: true,
            processingTime: processingTime,
            outputPath: outputPath,
            fileSize: fs.statSync(outputPath).size
        }));

    } catch (error) {
        console.error('PDF generation failed:', error.message);
        console.error('Stack trace:', error.stack);
        
        console.log(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }));
        
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.log(JSON.stringify({
        success: false,
        error: 'Uncaught exception: ' + error.message
    }));
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    console.log(JSON.stringify({
        success: false,
        error: 'Unhandled rejection: ' + reason
    }));
    process.exit(1);
});

// Run the generator
generatePDF(); 