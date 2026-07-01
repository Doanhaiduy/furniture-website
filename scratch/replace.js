const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// Replacement 1: Delete the submit button in left column of UserCreateEntityForm
const target1 = `          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="button-pd"
              disabled={formLoading}
            >
              {formLoading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>`;

const replacement1 = ``;

// Replacement 2: ReadinessPanel wrapper and Submit button inside right column of UserCreateEntityForm
const target2 = `      <ReadinessPanel
        items={[
          { label: "Vai trò khớp ma trận quyền của phương án A", state: "ready" },
          { label: "Tài khoản quản trị đầu tiên vẫn do vận hành backend thiết lập", state: "warning" },
          { label: "Mật khẩu sẽ có hiệu lực ngay lập tức", state: "ready" },
        ]}
      />`;

const replacement2 = `      <aside className="space-y-5">
        <ReadinessPanel
          items={[
            { label: "Vai trò khớp ma trận quyền của phương án A", state: "ready" },
            { label: "Tài khoản quản trị đầu tiên vẫn do vận hành backend thiết lập", state: "warning" },
            { label: "Mật khẩu sẽ có hiệu lực ngay lập tức", state: "ready" },
          ]}
        />
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Thao tác</h3>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Tạo tài khoản
              </>
            )}
          </button>
        </section>
      </aside>`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Deleted old User submit button successfully!");
} else {
  console.log("WARNING: target1 not found!");
}

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Wrapped User right column successfully!");
} else {
  console.log("WARNING: target2 not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
