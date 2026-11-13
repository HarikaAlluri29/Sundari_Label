# SUNDARI Google Sheets setup

This integration stores inventory, size quantities, vendor entries, and sales orders in a Google Sheet and loads that shared data whenever the website opens.

## Create and connect the sheet

1. Create or open the target Google Sheet.
2. In the sheet, choose **Extensions → Apps Script** and replace `Code.gs` with the current project `Code.gs`.
3. Select `setupSundariSheets` in the function list and choose **Run**. Approve Google’s authorization prompt. This creates the three tabs and connects the script to its parent spreadsheet.
4. Choose **Deploy → New deployment → Web app**. Set **Execute as** to your account and **Who has access** to **Anyone** so the website can send data without a Google sign-in session. For a deployment you already created, use **Manage deployments → Edit → New version** to publish the updated code.
5. Deploy and copy the URL ending in `/exec`.
6. In SUNDARI, open **Sync Google Sheets**, paste that URL, and choose **Check Connection**. If the status is ready, choose **Save & Sync**. This saves the URL and sends current inventory.
7. To make the deployed GitHub Pages site use the same sheet on every device, copy the URL into `SHARED_GOOGLE_SHEET_ENDPOINT` near the top of the app script in `index.html`, then publish the site again. A URL saved only through **Sync Google Sheets** stays in that device's browser storage and cannot configure other devices.

For a standalone Apps Script project, set `SPREADSHEET_ID` to the target Sheet ID before running `setupSundariSheets`.

The first sync creates the `Inventory`, `Vendor_Entries`, and `Sales_Orders` tabs. Inventory and vendor entries are added or updated by ID; order IDs are added once and updated on retry. The script adds new order columns to an older SUNDARI `Sales_Orders` tab when its existing headers match. Other tabs with different headers are left unchanged and reported as errors rather than being replaced.

## What is stored

- **Inventory:** product name and category, vendor, available stock, size types, per-size quantities, unit cost, selling price, image URL or compressed local-image data, and inventory entry ID.
- **Vendor_Entries:** vendor, received styles, additional charges, subtotals, entry total, vendor credit, and return records.
- **Sales_Orders:** order ID, date, customer name, phone and address, items and sizes (including image URL and unit cost in JSON), item subtotal, shipping, discount, payment method, total, status, courier partner, and tracking ID.

The site loads inventory, vendor entries, and sales orders from the sheet when it opens. It sends a full inventory snapshot after a vendor entry is added, when **Sync Now** is used, and after an order updates stock. Sales orders are also submitted to the orders tab. Deleting an order restores its recorded item quantities to inventory and removes its rows from the `Sales_Orders` tab. After changing `Code.gs`, deploy a new Apps Script web app version. Google Apps Script web apps use `doGet(e)` and `doPost(e)` to serve and receive these requests; see the official [web apps guide](https://developers.google.com/apps-script/guides/web) and [Spreadsheet service reference](https://developers.google.com/apps-script/reference/spreadsheet).

The updated script adds new return-credit, discount, courier partner, and tracking ID columns to existing compatible SUNDARI tabs when deployed. Keep the current sheet and its rows; do not delete the existing purchase or order data.

**Reset App Data** clears the local app records and sends `RESET_ALL_DATA` to the connected script. This clears data rows from all three SUNDARI tabs while keeping their headers. Replace `Code.gs` and deploy a new version before using this reset option so the web app has the reset handler.
