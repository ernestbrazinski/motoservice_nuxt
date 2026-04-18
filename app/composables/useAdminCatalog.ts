import { ref, type Ref, type ComputedRef } from "vue";
import { useAuthSession } from "./useAuthSession";
import { useCabinetToast } from "./useCabinetToast";
import { isValidKebabSlug, kebabSlugHint } from "~/utils/validateKebabSlug";

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

export type AdminBrand = { id: number; name: string; slug: string };
export type AdminTag = { id: number; name: string };
export type AdminProduct = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  currency: string;
  brandId: number | null;
  categoryId: number | null;
  images?: { id: number; url: string; isMain: boolean }[];
};
export type AdminOrder = {
  id: number;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  totalPrice: string | null;
  status: string | null;
  createdAt: string;
  items: {
    id: number;
    productId: number | null;
    variantId: number | null;
    quantity: number | null;
    price: string | null;
  }[];
};

const QUERY_ADMIN_CATALOG = `
query AdminCatalogContext {
  categories { id name slug parentId }
  brands { id name slug }
  tags { id name }
  products(limit: 500) {
    id
    title
    slug
    description
    price
    currency
    brandId
    categoryId
    images {
      id
      url
      isMain
    }
  }
}
`;

const M_CREATE_CATEGORY = `
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) { id name slug parentId }
}
`;

const M_CREATE_BRAND = `
mutation CreateBrand($input: CreateBrandInput!) {
  createBrand(input: $input) { id name slug logoUrl }
}
`;

const M_CREATE_TAG = `
mutation CreateTag($input: CreateTagInput!) {
  createTag(input: $input) { id name }
}
`;

const M_CREATE_PRODUCT = `
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) { id title slug price currency brandId categoryId }
}
`;

const M_ADD_PRODUCT_IMAGE = `
mutation AddProductImage($input: AddProductImageInput!) {
  addProductImage(input: $input) {
    id
    url
    isMain
  }
}
`;

const M_LINK_PRODUCT_TAG = `
mutation LinkProductTag($productId: Int!, $tagId: Int!) {
  linkProductTag(productId: $productId, tagId: $tagId)
}
`;

const M_UPDATE_PRODUCT = `
mutation UpdateProduct($id: Int!, $input: CreateProductInput!) {
  updateProduct(id: $id, input: $input) {
    id
    title
    slug
    price
    currency
    brandId
    categoryId
  }
}
`;

const M_CREATE_MOTORCYCLE_LISTING = `
mutation CreateMotorcycleListing($input: CreateMotorcycleListingInput!) {
  createMotorcycleListing(input: $input) {
    id
    brandId
    model
    year
    mileage
    mileageUnit
    vin
    price
    currency
    description
  }
}
`;

const M_ADD_MOTORCYCLE_LISTING_IMAGE = `
mutation AddMotorcycleListingImage($input: AddMotorcycleListingImageInput!) {
  addMotorcycleListingImage(input: $input) {
    id
    url
    sortOrder
    isMain
  }
}
`;

const QUERY_ORDERS = `
query AdminOrders {
  orders {
    id
    customerName
    customerEmail
    customerPhone
    totalPrice
    status
    createdAt
    items { id productId variantId quantity price }
  }
}
`;

export function useAdminCatalog() {
  const { gqlAuthorized, isSuperadmin } = useAuthSession();
  const { show: toast } = useCabinetToast();
  const canAdmin: ComputedRef<boolean> = isSuperadmin;

  const categories: Ref<AdminCategory[]> = ref([]);
  const brands: Ref<AdminBrand[]> = ref([]);
  const tags: Ref<AdminTag[]> = ref([]);
  const products: Ref<AdminProduct[]> = ref([]);

  const contextLoading = ref(false);
  const contextError = ref("");

  async function loadContext() {
    if (!canAdmin.value) return;
    contextLoading.value = true;
    contextError.value = "";
    try {
      const data = await gqlAuthorized<{
        categories: AdminCategory[];
        brands: AdminBrand[];
        tags: AdminTag[];
        products: AdminProduct[];
      }>(QUERY_ADMIN_CATALOG, undefined);
      categories.value = data.categories ?? [];
      brands.value = data.brands ?? [];
      tags.value = data.tags ?? [];
      products.value = data.products ?? [];
    } catch (e) {
      const m = e instanceof Error ? e.message : "Ошибка загрузки справочников";
      contextError.value = m;
      toast("error", m);
    } finally {
      contextLoading.value = false;
    }
  }

  const orders: Ref<AdminOrder[]> = ref([]);
  const ordersLoading = ref(false);

  async function loadOrders() {
    if (!canAdmin.value) return;
    ordersLoading.value = true;
    try {
      const data = await gqlAuthorized<{ orders: AdminOrder[] }>(
        QUERY_ORDERS,
        undefined,
      );
      orders.value = data.orders ?? [];
    } catch (e) {
      const m = e instanceof Error ? e.message : "Ошибка загрузки заказов";
      toast("error", m);
    } finally {
      ordersLoading.value = false;
    }
  }

  function checkKebabSlug(label: string, slug: string) {
    const t = slug.trim();
    if (!t) return `${label}: укажите slug`;
    if (!isValidKebabSlug(t)) {
      return `${label}: неверный формат slug. ${kebabSlugHint()}`;
    }
    return true;
  }

  async function submitCategory(input: {
    name: string;
    slug: string;
    parentId: number | null;
  }): Promise<boolean> {
    const n = input.name.trim();
    if (!n) {
      toast("error", "Категория: укажите название");
      return false;
    }
    const slugChk = checkKebabSlug("Категория", input.slug);
    if (slugChk !== true) {
      toast("error", slugChk);
      return false;
    }
    try {
      await gqlAuthorized(M_CREATE_CATEGORY, {
        input: {
          name: n,
          slug: input.slug.trim(),
          parentId: input.parentId,
        },
      });
      toast("success", "Категория создана");
      await loadContext();
      return true;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return false;
    }
  }

  async function submitBrand(input: {
    name: string;
    slug: string;
    logoUrl: string;
  }): Promise<boolean> {
    const n = input.name.trim();
    if (!n) {
      toast("error", "Бренд: укажите название");
      return false;
    }
    const slugChk = checkKebabSlug("Бренд", input.slug);
    if (slugChk !== true) {
      toast("error", slugChk);
      return false;
    }
    const logo = input.logoUrl.trim();
    try {
      await gqlAuthorized(M_CREATE_BRAND, {
        input: {
          name: n,
          slug: input.slug.trim(),
          logoUrl: logo || null,
        },
      });
      toast("success", "Бренд создан");
      await loadContext();
      return true;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return false;
    }
  }

  async function submitTag(name: string): Promise<boolean> {
    const n = name.trim();
    if (!n) {
      toast("error", "Тег: укажите название");
      return false;
    }
    try {
      await gqlAuthorized(M_CREATE_TAG, { input: { name: n } });
      toast("success", "Тег создан");
      await loadContext();
      return true;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return false;
    }
  }

  async function submitProduct(input: {
    title: string;
    slug: string;
    description: string;
    price: string;
    currency: string;
    brandId: number | null;
    categoryId: number | null;
  }): Promise<number | null> {
    const title = input.title.trim();
    if (!title) {
      toast("error", "Товар: укажите название");
      return null;
    }
    const slugChk = checkKebabSlug("Товар (slug)", input.slug);
    if (slugChk !== true) {
      toast("error", slugChk);
      return null;
    }
    const price = input.price.trim();
    if (!price) {
      toast("error", "Товар: укажите цену");
      return null;
    }
    const currency = input.currency.trim();
    if (!currency) {
      toast("error", "Товар: укажите валюту (например GEL)");
      return null;
    }
    try {
      const data = await gqlAuthorized<{ createProduct: { id: number } }>(
        M_CREATE_PRODUCT,
        {
          input: {
            title,
            slug: input.slug.trim(),
            description: input.description.trim() || null,
            price,
            currency,
            brandId: input.brandId,
            categoryId: input.categoryId,
          },
        },
      );
      const id = data.createProduct?.id;
      if (id == null || !Number.isFinite(id)) {
        toast("error", "Товар: ответ без id");
        return null;
      }
      toast("success", "Товар создан");
      await loadContext();
      return id;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return null;
    }
  }

  async function submitAddProductImages(
    productId: number,
    urls: string[],
    opts?: { firstInBatchIsMain?: boolean },
  ): Promise<boolean> {
    const firstInBatchIsMain = opts?.firstInBatchIsMain !== false;
    const trimmedList = urls.map((u) => u.trim()).filter(Boolean);
    if (!trimmedList.length) return true;
    if (!productId || !Number.isFinite(productId)) {
      toast("error", "Некорректный id товара");
      return false;
    }
    let added = 0;
    try {
      for (const url of trimmedList) {
        const isMain = firstInBatchIsMain && added === 0;
        await gqlAuthorized(M_ADD_PRODUCT_IMAGE, {
          input: { productId, url, isMain },
        });
        added += 1;
      }
      if (added > 0) {
        toast("success", `Добавлено фото: ${added}`);
        await loadContext();
      }
      return true;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return false;
    }
  }

  async function submitUpdateProduct(
    id: number,
    input: {
      title: string;
      slug: string;
      description: string;
      price: string;
      currency: string;
      brandId: number | null;
      categoryId: number | null;
    },
  ): Promise<boolean> {
    const title = input.title.trim();
    if (!title) {
      toast("error", "Товар: укажите название");
      return false;
    }
    const slugChk = checkKebabSlug("Товар (slug)", input.slug);
    if (slugChk !== true) {
      toast("error", slugChk);
      return false;
    }
    const price = input.price.trim();
    if (!price) {
      toast("error", "Товар: укажите цену");
      return false;
    }
    const currency = input.currency.trim();
    if (!currency) {
      toast("error", "Товар: укажите валюту (например GEL)");
      return false;
    }
    if (!id || !Number.isFinite(id)) {
      toast("error", "Выберите товар для правки");
      return false;
    }
    try {
      await gqlAuthorized(M_UPDATE_PRODUCT, {
        id,
        input: {
          title,
          slug: input.slug.trim(),
          description: input.description.trim() || null,
          price,
          currency,
          brandId: input.brandId,
          categoryId: input.categoryId,
        },
      });
      toast("success", "Товар обновлён");
      await loadContext();
      return true;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return false;
    }
  }

  async function submitMotorcycleListing(input: {
    brandId: number;
    model: string;
    year: number;
    mileage: number;
    mileageUnit: "KM" | "MI" | null;
    vin: string;
    price: string;
    currency: string;
    description: string | null;
  }): Promise<number | null> {
    const model = input.model.trim();
    if (!model) {
      toast("error", "Мото: укажите модель");
      return null;
    }
    const vin = input.vin.trim();
    if (vin.length < 5 || vin.length > 32) {
      toast("error", "VIN: от 5 до 32 символов");
      return null;
    }
    if (input.year < 1900 || input.year > 2100) {
      toast("error", "Год: 1900–2100");
      return null;
    }
    if (input.mileage < 0 || !Number.isFinite(input.mileage)) {
      toast("error", "Укажите корректный пробег");
      return null;
    }
    const price = input.price.trim();
    if (!price) {
      toast("error", "Укажите цену");
      return null;
    }
    const currency = input.currency.trim();
    if (!currency) {
      toast("error", "Укажите валюту");
      return null;
    }
    const gqlInput: Record<string, unknown> = {
      brandId: input.brandId,
      model,
      year: input.year,
      mileage: input.mileage,
      vin,
      price,
      currency,
      description: input.description?.trim() || null,
    };
    if (input.mileageUnit === "KM" || input.mileageUnit === "MI") {
      gqlInput.mileageUnit = input.mileageUnit;
    }
    try {
      const data = await gqlAuthorized<{
        createMotorcycleListing: { id: number };
      }>(M_CREATE_MOTORCYCLE_LISTING, { input: gqlInput });
      toast("success", "Объявление о мотоцикле создано");
      return data.createMotorcycleListing.id;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return null;
    }
  }

  async function submitMotorcycleListingImage(input: {
    listingId: number;
    url: string;
    isMain?: boolean;
    sortOrder?: number;
  }): Promise<boolean> {
    const url = input.url.trim();
    if (!url) return true;
    try {
      await gqlAuthorized(M_ADD_MOTORCYCLE_LISTING_IMAGE, {
        input: {
          listingId: input.listingId,
          url,
          isMain: input.isMain ?? false,
          sortOrder: input.sortOrder ?? 0,
        },
      });
      return true;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка загрузки фото");
      return false;
    }
  }

  async function submitLinkTag(
    productId: number | null,
    tagId: number | null,
  ): Promise<boolean> {
    if (productId == null) {
      toast("error", "Выберите товар");
      return false;
    }
    if (tagId == null) {
      toast("error", "Выберите тег");
      return false;
    }
    try {
      await gqlAuthorized(M_LINK_PRODUCT_TAG, { productId, tagId });
      toast("success", "Тег привязан к товару");
      return true;
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Ошибка");
      return false;
    }
  }

  return {
    canAdmin,
    categories,
    brands,
    tags,
    products,
    contextLoading,
    contextError,
    loadContext,
    /** hint text for form labels */
    slugHint: kebabSlugHint,
    submitCategory,
    submitBrand,
    submitTag,
    submitProduct,
    submitAddProductImages,
    submitUpdateProduct,
    submitLinkTag,
    submitMotorcycleListing,
    submitMotorcycleListingImage,
    orders,
    ordersLoading,
    loadOrders,
  };
}
