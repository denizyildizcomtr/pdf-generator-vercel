const puppeteer = require('puppeteer');

export default async function handler(req, res) {
    // Only POST allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { html, filename } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'HTML content required' });
        }

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport and content
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
            printBackground: true,
            displayHeaderFooter: false
        });

        await browser.close();

        // Return PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename || 'document.pdf'}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return res.status(500).json({
            error: 'PDF generation failed',
            message: error.message
        });
    }
}
