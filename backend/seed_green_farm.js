/**
 * Seed script: Fill "Green Farm" with realistic Kerala farm data
 * Run with: node seed_green_farm.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Farm = require("./models/Farm");
const Expense = require("./models/Expense");

// Try to load Income model if it exists
let Income;
try { Income = require("./models/Income"); } catch { Income = null; }

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/farmdb";

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // ── Find the "green farm" (case-insensitive) ──────────────────
    const farm = await Farm.findOne({ farmName: { $regex: /green/i } });
    if (!farm) {
        console.error("❌ Could not find a farm with 'green' in the name.");
        console.log("Available farms:");
        const all = await Farm.find({}, "farmName _id");
        all.forEach(f => console.log(`  - ${f.farmName}  [${f._id}]`));
        await mongoose.disconnect();
        return;
    }

    console.log(`✅ Found farm: "${farm.farmName}" (${farm._id})`);

    // ── Clear existing crops and replace with rich set ────────────
    farm.crops = [
        // Historical perennial – removed 2012
        {
            name: "Rubber",
            season: "Perennial",
            sownDate: new Date("2000-06-01"),
            removalDate: new Date("2012-03-15"),
            allocatedArea: 2.5,
            status: "Removed",
        },
        // Old coconut – removed 2020
        {
            name: "Coconut",
            season: "Perennial",
            sownDate: new Date("2005-01-10"),
            removalDate: new Date("2020-08-20"),
            allocatedArea: 1.5,
            status: "Removed",
        },
        // Currently active Banana
        {
            name: "Banana",
            season: "Perennial",
            sownDate: new Date("2023-04-01"),
            allocatedArea: 1.0,
            status: "Growing",
        },
        // Harvested paddy (Monsoon 2024)
        {
            name: "Paddy",
            season: "Monsoon",
            sownDate: new Date("2024-06-15"),
            expectedHarvestDate: new Date("2024-11-20"),
            removalDate: new Date("2024-11-20"),
            allocatedArea: 1.5,
            status: "Harvested",
        },
        // Harvested tapioca (2025)
        {
            name: "Tapioca",
            season: "Summer",
            sownDate: new Date("2025-02-10"),
            expectedHarvestDate: new Date("2025-10-10"),
            removalDate: new Date("2025-10-10"),
            allocatedArea: 0.8,
            status: "Harvested",
        },
        // Currently active – new Coconut plantation
        {
            name: "Coconut",
            season: "Perennial",
            sownDate: new Date("2022-03-15"),
            allocatedArea: 1.0,
            status: "Growing",
        },
        // Currently active Banana
        {
            name: "Banana",
            season: "Perennial",
            sownDate: new Date("2023-04-01"),
            allocatedArea: 0.8,
            status: "Growing",
        },
        // Ginger – harvested 2025
        {
            name: "Ginger",
            season: "Monsoon",
            sownDate: new Date("2025-05-20"),
            expectedHarvestDate: new Date("2025-12-15"),
            removalDate: new Date("2025-12-15"),
            allocatedArea: 0.5,
            status: "Harvested",
        },
        // Black Pepper – perennial, growing
        {
            name: "Black Pepper",
            season: "Perennial",
            sownDate: new Date("2024-07-10"),
            allocatedArea: 0.6,
            status: "Growing",
        },
        // Harvested paddy (Monsoon 2024)
        {
            name: "Paddy",
            season: "Monsoon",
            sownDate: new Date("2024-06-15"),
            expectedHarvestDate: new Date("2024-11-20"),
            removalDate: new Date("2024-11-20"),
            allocatedArea: 1.5,
            status: "Harvested",
        },
        // Harvested tapioca (2025)
        {
            name: "Tapioca",
            season: "Summer",
            sownDate: new Date("2025-02-10"),
            expectedHarvestDate: new Date("2025-10-10"),
            removalDate: new Date("2025-10-10"),
            allocatedArea: 0.6,
            status: "Harvested",
        },
        // Current season – growing vegetables
        {
            name: "Bitter Gourd",
            season: "Summer",
            sownDate: new Date("2026-01-05"),
            expectedHarvestDate: new Date("2026-04-30"),
            allocatedArea: 0.4,
            status: "Growing",
        },
        // Planned next crop
        {
            name: "Paddy",
            season: "Monsoon",
            sownDate: new Date("2026-06-20"),
            expectedHarvestDate: new Date("2026-11-25"),
            allocatedArea: 1.5,
            status: "Planned",
        },
    ];

    await farm.save();
    console.log(`✅ Crops updated (${farm.crops.length} crops)`);

    // ── Seed Expenses ─────────────────────────────────────────────
    await Expense.deleteMany({ farmId: farm._id });
    console.log("🗑  Cleared existing expenses");

    const userId = farm.userId; // reuse the farm's owner

    const rawExpenses = [
        // 2024 – Paddy season
        { cropName: "Paddy", category: "Seeds", title: "Paddy seeds (Uma variety)", amount: 3200, expenseDate: new Date("2024-06-10") },
        { cropName: "Paddy", category: "Fertilizer", title: "Urea – first dose", amount: 1800, expenseDate: new Date("2024-07-01") },
        { cropName: "Paddy", category: "Fertilizer", title: "DAP – second dose", amount: 2200, expenseDate: new Date("2024-08-05") },
        { cropName: "Paddy", category: "Labor", title: "Transplanting labor", amount: 5000, expenseDate: new Date("2024-06-20") },
        { cropName: "Paddy", category: "Pesticide", title: "Blast control spray", amount: 900, expenseDate: new Date("2024-09-12") },
        { cropName: "Paddy", category: "Labor", title: "Harvesting labor", amount: 6000, expenseDate: new Date("2024-11-15") },
        { cropName: "Paddy", category: "Machinery", title: "Harvester machine rental", amount: 3500, expenseDate: new Date("2024-11-14") },
        { cropName: "Paddy", category: "Other", title: "Mill transport (2 truck trips)", amount: 1200, expenseDate: new Date("2024-11-22") },

        // 2024 – Black Pepper (planting year)
        { cropName: "Black Pepper", category: "Seeds", title: "Pepper vine cuttings (50 nos)", amount: 2500, expenseDate: new Date("2024-07-08") },
        { cropName: "Black Pepper", category: "Labor", title: "Pit digging + planting labor", amount: 3000, expenseDate: new Date("2024-07-12") },
        { cropName: "Black Pepper", category: "Fertilizer", title: "Bone meal + wood ash mix", amount: 1200, expenseDate: new Date("2024-08-20") },
        { cropName: "Black Pepper", category: "Irrigation", title: "Drip irrigation setup", amount: 2800, expenseDate: new Date("2024-09-01") },

        // 2025 – Tapioca
        { cropName: "Tapioca", category: "Seeds", title: "Tapioca stakes purchase", amount: 1500, expenseDate: new Date("2025-02-05") },
        { cropName: "Tapioca", category: "Labor", title: "Land preparation + planting", amount: 4200, expenseDate: new Date("2025-02-10") },
        { cropName: "Tapioca", category: "Fertilizer", title: "Potash + compost", amount: 1600, expenseDate: new Date("2025-04-15") },
        { cropName: "Tapioca", category: "Pesticide", title: "Mealybug treatment", amount: 700, expenseDate: new Date("2025-06-20") },
        { cropName: "Tapioca", category: "Labor", title: "Harvesting + transport labor", amount: 4500, expenseDate: new Date("2025-10-08") },

        // 2025 – Ginger (full cycle)
        { cropName: "Ginger", category: "Seeds", title: "Seed rhizomes (100 kg)", amount: 8000, expenseDate: new Date("2025-05-15") },
        { cropName: "Ginger", category: "Labor", title: "Bed making + planting", amount: 3500, expenseDate: new Date("2025-05-22") },
        { cropName: "Ginger", category: "Fertilizer", title: "Neem cake + potash", amount: 2200, expenseDate: new Date("2025-06-30") },
        { cropName: "Ginger", category: "Pesticide", title: "Rhizome rot preventive drench", amount: 1100, expenseDate: new Date("2025-08-10") },
        { cropName: "Ginger", category: "Fertilizer", title: "Foliar urea spray", amount: 600, expenseDate: new Date("2025-09-20") },
        { cropName: "Ginger", category: "Labor", title: "Harvesting + cleaning labor", amount: 4000, expenseDate: new Date("2025-12-10") },

        // 2025 – Banana (perennial care)
        { cropName: "Banana", category: "Fertilizer", title: "Banana bunch spray (boron)", amount: 1100, expenseDate: new Date("2025-03-10") },
        { cropName: "Banana", category: "Pesticide", title: "Fusarium wilt preventive", amount: 850, expenseDate: new Date("2025-05-22") },
        { cropName: "Banana", category: "Labor", title: "Propping + leaf removal", amount: 2000, expenseDate: new Date("2025-07-15") },

        // 2025 – Coconut (young palm care)
        { cropName: "Coconut", category: "Fertilizer", title: "NPK mixture for young palms", amount: 1800, expenseDate: new Date("2025-04-05") },
        { cropName: "Coconut", category: "Pesticide", title: "Rhinoceros beetle treatment", amount: 650, expenseDate: new Date("2025-06-18") },
        { cropName: "Coconut", category: "Labor", title: "De-bushing + basin making", amount: 1200, expenseDate: new Date("2025-09-10") },

        // 2026 – Bitter Gourd (current crop)
        { cropName: "Bitter Gourd", category: "Seeds", title: "Hybrid Bitter Gourd seeds", amount: 650, expenseDate: new Date("2026-01-03") },
        { cropName: "Bitter Gourd", category: "Labor", title: "Bed preparation + sowing", amount: 2500, expenseDate: new Date("2026-01-05") },
        { cropName: "Bitter Gourd", category: "Fertilizer", title: "Vermicompost (200 kg)", amount: 1200, expenseDate: new Date("2026-01-20") },
        { cropName: "Bitter Gourd", category: "Irrigation", title: "Drip line repair + setup", amount: 1800, expenseDate: new Date("2026-02-01") },
        { cropName: "Bitter Gourd", category: "Pesticide", title: "Aphid + whitefly spray", amount: 550, expenseDate: new Date("2026-02-25") },
        { cropName: "Bitter Gourd", category: "Labor", title: "Staking and training", amount: 1500, expenseDate: new Date("2026-03-01") },

        // 2026 – Banana (Jan harvest cycle)
        { cropName: "Banana", category: "Labor", title: "Bunch harvest + packing", amount: 1800, expenseDate: new Date("2026-01-20") },
        { cropName: "Banana", category: "Fertilizer", title: "Post-harvest sucker nutrition", amount: 900, expenseDate: new Date("2026-02-05") },

        // 2026 – Black Pepper (second year maintenance)
        { cropName: "Black Pepper", category: "Fertilizer", title: "Organic manure top dressing", amount: 1500, expenseDate: new Date("2026-01-25") },
        { cropName: "Black Pepper", category: "Labor", title: "Training vines on poles", amount: 1200, expenseDate: new Date("2026-02-18") },
        { cropName: "Black Pepper", category: "Pesticide", title: "Phytophthora preventive spray", amount: 800, expenseDate: new Date("2026-03-02") },

        // 2026 – Coconut (ongoing care)
        { cropName: "Coconut", category: "Fertilizer", title: "Urea + MOP – annual dose", amount: 2000, expenseDate: new Date("2026-01-10") },
        { cropName: "Coconut", category: "Labor", title: "Frond removal + climbing", amount: 1500, expenseDate: new Date("2026-02-22") },
    ];

    const expenseData = rawExpenses.map(e => ({ ...e, farmId: farm._id, userId }));
    await Expense.insertMany(expenseData);
    console.log(`✅ Inserted ${expenseData.length} expense records`);

    // ── Seed Income (if model exists) ─────────────────────────────
    if (Income) {
        try {
            await Income.deleteMany({ farmId: farm._id });
            console.log("🗑  Cleared existing income records");

            const incomeData = [
                // 2024 – Paddy Harvest
                {
                    farmId: farm._id, userId, cropName: "Paddy",
                    quantity: 850, pricePerUnit: 22, totalAmount: 18700,
                    soldDate: new Date("2024-11-28"), notes: "Sold to local mill (Uma variety)"
                },
                // 2025 – Tapioca Harvest
                {
                    farmId: farm._id, userId, cropName: "Tapioca",
                    quantity: 1200, pricePerUnit: 15, totalAmount: 18000,
                    soldDate: new Date("2025-10-15"), notes: "Wholesale buyer (1.2 tons)"
                },
                // 2025 – Banana (First major harvest)
                {
                    farmId: farm._id, userId, cropName: "Banana",
                    quantity: 450, pricePerUnit: 35, totalAmount: 15750,
                    soldDate: new Date("2025-08-20"), notes: "Harvested 40 bunches"
                },
                // 2025 – Ginger (Dec Harvest)
                {
                    farmId: farm._id, userId, cropName: "Ginger",
                    quantity: 400, pricePerUnit: 140, totalAmount: 56000,
                    soldDate: new Date("2025-12-10"), notes: "High yield from 100kg seeds"
                },
                // 2026 – Banana (Jan harvest)
                {
                    farmId: farm._id, userId, cropName: "Banana",
                    quantity: 380, pricePerUnit: 38, totalAmount: 14440,
                    soldDate: new Date("2026-01-12"), notes: "Off-season price advantage"
                },
                // 2026 – Black Pepper (Feb harvest)
                {
                    farmId: farm._id, userId, cropName: "Black Pepper",
                    quantity: 80, pricePerUnit: 600, totalAmount: 48000,
                    soldDate: new Date("2026-02-15"), notes: "Dry pepper berries (80kg)"
                },
                // 2026 – Coconut (Feb plucked)
                {
                    farmId: farm._id, userId, cropName: "Coconut",
                    quantity: 500, pricePerUnit: 15, totalAmount: 7500,
                    soldDate: new Date("2026-02-28"), notes: "Bulk sale to oil mill"
                },
                // 2026 – Banana (March current harvest)
                {
                    farmId: farm._id, userId, cropName: "Banana",
                    quantity: 200, pricePerUnit: 40, totalAmount: 8000,
                    soldDate: new Date("2026-03-02"), notes: "Recent bunch sales"
                }
            ];
            await Income.insertMany(incomeData);
            console.log(`✅ Inserted ${incomeData.length} income records`);
        } catch (e) {
            console.log("⚠️  Income model insert failed/skipped:", e.message);
        }
    }


    console.log("\n🌾 Seeding complete! Farm is ready to explore.");
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
