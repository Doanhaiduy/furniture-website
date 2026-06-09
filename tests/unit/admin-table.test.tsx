import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../../components/admin/DataTable";
import { ErrorFallback, TableSkeleton } from "../../components/admin/TableSkeleton";

type SampleRow = {
  id: string;
  name: string;
  price: string;
  status: string;
};

const sampleRows: SampleRow[] = [
  { id: "1", name: "Sofa da", price: "12.000.000", status: "active" },
  { id: "2", name: "Bàn ăn", price: "8.500.000", status: "draft" },
  { id: "3", name: "Kệ tivi", price: "3.200.000", status: "active" },
];

const columns = [
  { key: "name", header: "Tên", render: (row: SampleRow) => <span>{row.name}</span> },
  { key: "price", header: "Giá", render: (row: SampleRow) => <span>{row.price}</span> },
  { key: "status", header: "Trạng thái", render: (row: SampleRow) => <span>{row.status}</span> },
];

describe("DataTable", () => {
  it("renders rows and respects page size", () => {
    render(<DataTable data={sampleRows} columns={columns} pageSize={2} />);
    expect(screen.getByText("Sofa da")).toBeVisible();
    expect(screen.getByText("Bàn ăn")).toBeVisible();
    expect(screen.queryByText("Kệ tivi")).not.toBeInTheDocument();
  });

  it("navigates pages with prev/next buttons", async () => {
    const user = userEvent.setup();
    render(<DataTable data={sampleRows} columns={columns} pageSize={2} />);
    expect(screen.queryByText("Kệ tivi")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sau" }));
    expect(screen.getByText("Kệ tivi")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Trước" }));
    expect(screen.queryByText("Kệ tivi")).not.toBeInTheDocument();
  });

  it("filters rows via search input", async () => {
    const user = userEvent.setup();
    render(<DataTable data={sampleRows} columns={columns} />);
    await user.type(screen.getByPlaceholderText("Tìm kiếm..."), "Sofa");
    expect(screen.getByText("Sofa da")).toBeVisible();
    expect(screen.queryByText("Bàn ăn")).not.toBeInTheDocument();
  });

  it("sorts rows when clicking column headers", async () => {
    const user = userEvent.setup();
    const { container } = render(<DataTable data={sampleRows} columns={columns} pageSize={3} />);
    await user.click(screen.getByRole("button", { name: /Tên/ }));
    let names = Array.from(container.querySelectorAll(".divide-y > div > div:first-child span")).map((node) => node.textContent);
    expect(names[0]).toBe("Bàn ăn");

    await user.click(screen.getByRole("button", { name: /Tên/ }));
    names = Array.from(container.querySelectorAll(".divide-y > div > div:first-child span")).map((node) => node.textContent);
    expect(names[0]).toBe("Sofa da");
  });

  it("renders empty state when data is empty", () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Chưa có bản ghi." />);
    expect(screen.getByText("Chưa có bản ghi.")).toBeVisible();
  });

  it("renders error state with retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<DataTable data={sampleRows} columns={columns} error="Lỗi kết nối." onRetry={onRetry} />);
    expect(screen.getByText("Lỗi kết nối.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("TableSkeleton", () => {
  it("renders the default skeleton", () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders a custom row and column count", () => {
    const { container } = render(<TableSkeleton rows={2} columns={3} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

describe("ErrorFallback", () => {
  it("renders default error content", () => {
    render(<ErrorFallback />);
    expect(screen.getByText("Không thể tải dữ liệu")).toBeVisible();
    expect(screen.getByText("Vui lòng thử lại sau giây lát.")).toBeVisible();
  });

  it("renders custom error content and retry button", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorFallback title="Lỗi kết nối" description="Mạng bị gián đoạn." retryLabel="Tải lại" onRetry={onRetry} />,
    );
    expect(screen.getByText("Lỗi kết nối")).toBeVisible();
    expect(screen.getByText("Mạng bị gián đoạn.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Tải lại" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
