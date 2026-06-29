const Category = require("../models/Category");




const getCategories = async (req, res) => {
  try {
    
    const categories = await Category.find({ status: { $ne: "Archived" } });
    
    
    const formattedCategories = categories.map(cat => {
      const c = cat.toObject();
      c.id = c._id.toString();
      return c;
    });

    res.status(200).json({
      success: true,
      count: formattedCategories.length,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching categories" });
  }
};




const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    const formattedCategory = category.toObject();
    formattedCategory.id = formattedCategory._id.toString();

    
    if (global.io) {
      global.io.emit("category_created", formattedCategory);
      console.log(`[Socket] Emitted category_created: ${formattedCategory.name}`);
    }

    res.status(201).json({
      success: true,
      category: formattedCategory,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ success: false, message: "Server error creating category" });
  }
};




const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const formattedCategory = category.toObject();
    formattedCategory.id = formattedCategory._id.toString();

    
    if (global.io) {
      global.io.emit("category_updated", formattedCategory);
      console.log(`[Socket] Emitted category_updated: ${formattedCategory.name}`);
    }

    res.status(200).json({
      success: true,
      category: formattedCategory,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ success: false, message: "Server error updating category" });
  }
};




const deleteCategory = async (req, res) => {
  try {
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { status: "Archived" },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const id = req.params.id;

    
    if (global.io) {
      global.io.emit("category_deleted", { id });
      console.log(`[Socket] Emitted category_deleted: ${id}`);
    }

    res.status(200).json({
      success: true,
      message: "Category archived successfully",
      id,
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ success: false, message: "Server error deleting category" });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
