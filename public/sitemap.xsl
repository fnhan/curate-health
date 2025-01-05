<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
    <xsl:output method="html" indent="yes" />
    <xsl:template match="/">
        <html>
            <head>
                <title>XML Sitemap</title>
                <style type="text/css">
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f9f9f9;
                    }
                    .container {
                        width: 80%;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #fff;
                        border: 1px solid #ddd;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f4f4f4;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>XML Sitemap</h1>
                    <table>
                        <tr>
                            <th>URL</th>
                            <th>Last Modified</th>
                            <th>Change Frequency</th>
                            <th>Priority</th>
                        </tr>
                        <xsl:for-each select="sitemap:urlset/sitemap:url">
                            <tr>
                                <td><xsl:value-of select="sitemap:loc" /></td>
                                <td><xsl:value-of select="sitemap:lastmod" /></td>
                                <td><xsl:value-of select="sitemap:changefreq" /></td>
                                <td><xsl:value-of select="sitemap:priority" /></td>
                            </tr>
                        </xsl:for-each>
                    </table>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
