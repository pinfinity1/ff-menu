// --- داده‌های موجود (بدون تغییر) ---
let mockCategories = [
  {
    id: 1,
    name: "پیتزاها",
    products: [
      {
        id: 101,
        name: "پیتزا مخصوص",
        description: "ژامبون گوشت و مرغ...",
        price: 250000,
        imageUrl: "/images/icon.png",
      },
      {
        id: 102,
        name: "پیتزا پپرونی",
        description: "پپرونی، قارچ...",
        price: 280000,
        imageUrl: "/images/icon.png",
      },
    ],
  },
  {
    id: 2,
    name: "برگرها",
    products: [
      {
        id: 201,
        name: "چیزبرگر",
        description: "برگر دست‌ساز، پنیر...",
        price: 190000,
        imageUrl: "/images/icon.png",
      },
    ],
  },
  { id: 3, name: "نوشیدنی‌ها", products: [] },
];
// --- توابع دسته‌بندی (بدون تغییر) ---
export const getCategories = () => {
  return mockCategories.map((c) => ({
    id: c.id,
    name: c.name,
    productCount: c.products.length,
  }));
};
export const getFullCategories = () => {
  return mockCategories;
};
export const getCategoryById = (id) => {
  return mockCategories.find((c) => c.id === id);
};
export const addCategory = (name) => {
  const newId = Math.max(0, ...mockCategories.map((c) => c.id)) + 1;
  const newCategory = { id: newId, name: name, products: [] };
  mockCategories.push(newCategory);
  return newCategory;
};
export const updateCategory = (id, newName) => {
  const category = mockCategories.find((c) => c.id === id);
  if (category) {
    category.name = newName;
    return category;
  }
  return null;
};
export const deleteCategory = (id) => {
  const index = mockCategories.findIndex((c) => c.id === id);
  if (index > -1) {
    if (mockCategories[index].products.length > 0) {
      throw new Error("This category has products and cannot be deleted.");
    }
    mockCategories.splice(index, 1);
    return true;
  }
  return false;
};

// ===================================
// --- توابع جدید برای محصولات ---
// ===================================

let nextProductId = 103; // برای ID محصولات جدید

// پیدا کردن یک محصول در تمام دسته‌بندی‌ها
const findProduct = (productId) => {
  for (const category of mockCategories) {
    const product = category.products.find((p) => p.id === productId);
    if (product) {
      return { product, category };
    }
  }
  return { product: null, category: null };
};

export const getProducts = () => {
  const allProducts = [];
  for (const category of mockCategories) {
    for (const product of category.products) {
      allProducts.push({
        ...product,
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  }
  return allProducts;
};

export const getProductById = (id) => {
  const { product, category } = findProduct(id);
  if (product) {
    return { ...product, categoryId: category.id };
  }
  return null;
};

export const addProduct = (data) => {
  const category = getCategoryById(data.categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  const newProduct = {
    id: nextProductId++,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl || "/images/icon.png", //
  };

  category.products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id, data) => {
  const { product, category: oldCategory } = findProduct(id);
  if (!product) {
    throw new Error("Product not found");
  }

  const updatedProduct = {
    ...product,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl || "/images/icon.png", //
  };

  // اگر دسته‌بندی تغییر نکرده باشد
  if (oldCategory.id === data.categoryId) {
    const productIndex = oldCategory.products.findIndex((p) => p.id === id);
    oldCategory.products[productIndex] = updatedProduct;
  } else {
    // اگر دسته‌بندی تغییر کرده باشد
    // ۱. از دسته‌بندی قدیمی حذف کن
    oldCategory.products = oldCategory.products.filter((p) => p.id !== id);
    // ۲. به دسته‌بندی جدید اضافه کن
    const newCategory = getCategoryById(data.categoryId);
    if (!newCategory) throw new Error("New category not found");
    newCategory.products.push(updatedProduct);
  }
  return updatedProduct;
};

export const deleteProduct = (id) => {
  const { product, category } = findProduct(id);
  if (!product) {
    throw new Error("Product not found");
  }
  // محصول را از آرایه محصولات دسته‌بندی‌اش حذف کن
  category.products = category.products.filter((p) => p.id !== id);
  return true;
};
