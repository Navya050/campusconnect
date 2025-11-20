const mongoose = require("mongoose");
const Group = require("../models/group");

async function createAllGroups() {
  try {
    console.log("Starting group creation...");

    // Connect to MongoDB Atlas
    await mongoose.connect(
      process.env.MONGODB_KEY
    );
    console.log("Connected to MongoDB Atlas");

    // Define all categories
    const categoryOptions = [
      { label: "Information Technology, B.S.", value: "it", opt: "ug" },
      { label: "Cyber Security, B.S.", value: "cs", opt: "ug" },
      { label: "Philosophy, B.A.", value: "phil", opt: "ug" },
      { label: "Psychology, B.A.", value: "psych", opt: "ug" },
      { label: "Environmental Science, B.S.", value: "es", opt: "ug" },
      { label: "Sociology, B.A.", value: "social", opt: "ug" },
      { label: "Political Science, B.A./B.S.", value: "political", opt: "ug" },
      { label: "History, B.A.", value: "history", opt: "ug" },
      {
        label: "General Business Administration, B.S.",
        value: "gba",
        opt: "ug",
      },
      { label: "Marketing, B.S.", value: "market", opt: "ug" },
      { label: "M.S. in Computer Science", value: "cse", opt: "pg" },
      { label: "M.S. in Applied Mathematics", value: "am", opt: "pg" },
      { label: "M.S. in Chemistry", value: "chem", opt: "pg" },
      { label: "M.S. in Accounting", value: "acc", opt: "pg" },
      { label: "M.S. in Biology", value: "bio", opt: "pg" },
      { label: "M.P.H. Master of Public Health", value: "ph", opt: "pg" },
      {
        label: "M.A. in Clinical Mental Health Counselling",
        value: "cmhc",
        opt: "pg",
      },
      {
        label: "Master of Business Administration (MBA)",
        value: "mba",
        opt: "pg",
      },
      {
        label: "Master of Arts in Human Resource Development",
        value: "hr",
        opt: "pg",
      },
      {
        label: "Master of Arts in Linguistics",
        value: "linguistic",
        opt: "pg",
      },
    ];

    const graduationYears = ["2023", "2024", "2025", "2026", "2027", "2028"];

    // Create all groups
    const groupsToCreate = [];

    for (const category of categoryOptions) {
      for (const year of graduationYears) {
        const educationLevel = category.opt.toUpperCase();

        const groupData = {
          name: `${category.label} - ${educationLevel} - ${year}`,
          description: `Default group for ${category.label} ${educationLevel} students graduating in ${year}`,
          category: category.value,
          educationLevel: educationLevel,
          graduationYear: year,
          maxCapacity: 50,
          isActive: true,
        };

        groupsToCreate.push(groupData);
      }
    }

    console.log(`Creating ${groupsToCreate.length} groups...`);

    // Insert all groups
    await Group.insertMany(groupsToCreate, { ordered: false });
    console.log("All groups created successfully!");

    // Verify creation
    const totalCount = await Group.countDocuments();
    console.log(`Total groups in database: ${totalCount}`);

    // Show some examples
    const sampleGroups = await Group.find()
      .limit(5)
      .select("name category educationLevel graduationYear");
    console.log("\n Sample groups created:");
    sampleGroups.forEach((group) => {
      console.log(`  - ${group.name}`);
    });

    await mongoose.connection.close();
    console.log("\n Database connection closed");
    console.log("Script completed successfully!");
  } catch (error) {
    console.error("Error:", error.message);
    if (error.code === 11000) {
      console.log("Some groups may already exist (duplicate key error)");

      // Still check total count
      try {
        const totalCount = await Group.countDocuments();
        console.log(`Total groups in database: ${totalCount}`);
      } catch (e) {
        console.error("Error counting groups:", e.message);
      }
    }

    try {
      await mongoose.connection.close();
    } catch (e) {
      // Connection might already be closed
    }
  }
}

createAllGroups();
