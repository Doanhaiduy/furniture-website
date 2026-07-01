const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'components', 'showroom', 'admin-pages.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Thêm import FileSpreadsheet, Upload vào lucide-react
if (!content.includes('FileSpreadsheet')) {
  content = content.replace(
    '  Folder,\n} from "lucide-react";',
    '  Folder,\n  FileSpreadsheet,\n  Upload,\n} from "lucide-react";'
  );
}

// 2. Thêm import ExcelImportExportModal
if (!content.includes('ExcelImportExportModal')) {
  content = content.replace(
    'import { useState, useEffect, useCallback } from "react";',
    'import { useState, useEffect, useCallback } from "react";\nimport { ExcelImportExportModal } from "./admin-excel";'
  );
}

// 3. Tích hợp vào ProductsPage
const productsPageStateOld = `function ProductsPage({ createMode, products = [], total = 0 }: { createMode?: boolean; products?: AdminProduct[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const adminFilters = useAdminFilters();
  const { toast } = useToast();
  const router = useRouter();`;

const productsPageStateNew = `function ProductsPage({ createMode, products = [], total = 0 }: { createMode?: boolean; products?: AdminProduct[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const adminFilters = useAdminFilters();
  const { toast } = useToast();
  const router = useRouter();
  const [excelModalOpen, setExcelModalOpen] = useState(false);`;

content = content.replace(productsPageStateOld, productsPageStateNew);

const productsPageHeaderOld = `      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Vận hành danh mục ưu tiên báo giá: trường song ngữ, ánh xạ danh mục, tệp, thông số, trạng thái giá và mức độ sẵn sàng xuất bản."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />`;

const productsPageHeaderNew = `      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Vận hành danh mục ưu tiên báo giá: trường song ngữ, ánh xạ danh mục, tệp, thông số, trạng thái giá và mức độ sẵn sàng xuất bản."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />

      {/* Excel Actions Toolbar */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm w-fit">
        <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5 font-mono uppercase tracking-wider select-none">
          <FileSpreadsheet className="size-4 text-indigo-500" />
          Excel:
        </span>
        <button
          type="button"
          onClick={() => setExcelModalOpen(true)}
          className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-750 hover:border-indigo-200 transition cursor-pointer"
        >
          <Upload className="size-3.5" />
          Nhập & Xuất Excel
        </button>
      </div>`;

content = content.replace(productsPageHeaderOld, productsPageHeaderNew);

const productsPageDialogOld = `      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/products"
        title="Hiệu chỉnh sản phẩm"
        description="Chỉnh sửa thông tin chi tiết của sản phẩm hiện có."
        size="full"
      >
        <ContentEditorForm kind="product" />
      </AdminRouteDialog>
    </div>
  );
}`;

const productsPageDialogNew = `      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/products"
        title="Hiệu chỉnh sản phẩm"
        description="Chỉnh sửa thông tin chi tiết của sản phẩm hiện có."
        size="full"
      >
        <ContentEditorForm kind="product" />
      </AdminRouteDialog>

      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        type="product"
        currentData={products}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}`;

content = content.replace(productsPageDialogOld, productsPageDialogNew);


// 4. Tích hợp vào CategoryPage
const categoryPageStateOld = `function CategoryPage({ createMode, categories = [], total = 0 }: { createMode?: boolean; categories?: AdminCategory[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();`;

const categoryPageStateNew = `function CategoryPage({ createMode, categories = [], total = 0 }: { createMode?: boolean; categories?: AdminCategory[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();
  const [excelModalOpen, setExcelModalOpen] = useState(false);`;

content = content.replace(categoryPageStateOld, categoryPageStateNew);

const categoryPageHeaderOld = `      <AdminPageHeader
        title="Quản trị danh mục"
        description="Nhóm danh mục cố định theo nghiệp vụ. Admin quản lý danh mục con, tên song ngữ, đường dẫn và SEO."
        actionHref="/admin/categories?create=1"
        actionLabel="Thêm danh mục"
      />`;

const categoryPageHeaderNew = `      <AdminPageHeader
        title="Quản trị danh mục"
        description="Nhóm danh mục cố định theo nghiệp vụ. Admin quản lý danh mục con, tên song ngữ, đường dẫn và SEO."
        actionHref="/admin/categories?create=1"
        actionLabel="Thêm danh mục"
      />

      {/* Excel Actions Toolbar */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm w-fit">
        <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5 font-mono uppercase tracking-wider select-none">
          <FileSpreadsheet className="size-4 text-indigo-500" />
          Excel:
        </span>
        <button
          type="button"
          onClick={() => setExcelModalOpen(true)}
          className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-750 hover:border-indigo-200 transition cursor-pointer"
        >
          <Upload className="size-3.5" />
          Nhập & Xuất Excel
        </button>
      </div>`;

content = content.replace(categoryPageHeaderOld, categoryPageHeaderNew);

const categoryPageDialogOld = `      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/categories"
        title="Hiệu chỉnh danh mục"
        description="Chỉnh sửa thông tin chi tiết danh mục, cấu hình song ngữ, mô tả và SEO."
        size="full"
      >
        <EntityCreateForm kind="category" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>
    </div>
  );
}`;

const categoryPageDialogNew = `      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/categories"
        title="Hiệu chỉnh danh mục"
        description="Chỉnh sửa thông tin chi tiết danh mục, cấu hình song ngữ, mô tả và SEO."
        size="full"
      >
        <EntityCreateForm kind="category" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        type="category"
        currentData={categories}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}`;

content = content.replace(categoryPageDialogOld, categoryPageDialogNew);


// 5. Tích hợp vào ShowroomPage
const showroomPageStateOld = `function ShowroomPage({ createMode, showrooms = [], total = 0 }: { createMode?: boolean; showrooms?: AdminShowroom[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();`;

const showroomPageStateNew = `function ShowroomPage({ createMode, showrooms = [], total = 0 }: { createMode?: boolean; showrooms?: AdminShowroom[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();
  const [excelModalOpen, setExcelModalOpen] = useState(false);`;

content = content.replace(showroomPageStateOld, showroomPageStateNew);

const showroomPageHeaderOld = `      <AdminPageHeader
        title="Quản lý showroom"
        description="Quản lý tên và địa chỉ song ngữ của showroom, hotline, giờ mở cửa, nhúng bản đồ, đường dẫn dự phòng, tệp và trạng thái xuất bản."
        actionHref="/admin/showrooms?create=1"
        actionLabel="Thêm showroom"
      />`;

const showroomPageHeaderNew = `      <AdminPageHeader
        title="Quản lý showroom"
        description="Quản lý tên và địa chỉ song ngữ của showroom, hotline, giờ mở cửa, nhúng bản đồ, đường dẫn dự phòng, tệp và trạng thái xuất bản."
        actionHref="/admin/showrooms?create=1"
        actionLabel="Thêm showroom"
      />

      {/* Excel Actions Toolbar */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm w-fit">
        <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5 font-mono uppercase tracking-wider select-none">
          <FileSpreadsheet className="size-4 text-indigo-500" />
          Excel:
        </span>
        <button
          type="button"
          onClick={() => setExcelModalOpen(true)}
          className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-750 hover:border-indigo-200 transition cursor-pointer"
        >
          <Upload className="size-3.5" />
          Nhập & Xuất Excel
        </button>
      </div>`;

content = content.replace(showroomPageHeaderOld, showroomPageHeaderNew);

const showroomPageDialogOld = `      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/showrooms"
        title="Hiệu chỉnh showroom"
        description="Chỉnh sửa thông tin địa chỉ song ngữ, hotline, bản đồ và giờ mở cửa."
        size="full"
      >
        <EntityCreateForm kind="showroom" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>
    </div>
  );
}`;

const showroomPageDialogNew = `      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/showrooms"
        title="Hiệu chỉnh showroom"
        description="Chỉnh sửa thông tin địa chỉ song ngữ, hotline, bản đồ và giờ mở cửa."
        size="full"
      >
        <EntityCreateForm kind="showroom" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        type="showroom"
        currentData={showrooms}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}`;

content = content.replace(showroomPageDialogOld, showroomPageDialogNew);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('✅ Excel Integration successfully applied to admin-pages.tsx!');
