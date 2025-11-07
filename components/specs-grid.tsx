import type { ProductSpecs } from "@/lib/types"

interface SpecsGridProps {
  specs: ProductSpecs
}

export default function SpecsGrid({ specs }: SpecsGridProps) {
  const specGroups = [
    {
      title: "Bộ Xử Lý & Bộ Nhớ",
      items: [
        { label: "RAM", value: `${specs.ram / 1024}GB` },
        { label: "Bộ Nhớ Trong", value: `${specs.int_memory}GB` },
        { label: "Số Lõi", value: specs.n_cores },
        { label: "Tốc Độ Xung Nhịp", value: `${specs.clock_speed}GHz` },
      ],
    },
    {
      title: "Màn Hình",
      items: [
        { label: "Kích Thước", value: `${specs.sc_w}"` },
        { label: "Độ Phân Giải", value: `${specs.px_width}x${specs.px_height}` },
        { label: "Công Nghệ Cảm Ứng", value: specs.touch_screen ? "Có" : "Không" },
      ],
    },
    {
      title: "Camera",
      items: [
        { label: "Camera Chính", value: `${specs.pc}MP` },
        { label: "Camera Trước", value: `${specs.fc}MP` },
      ],
    },
    {
      title: "Pin & Kết Nối",
      items: [
        { label: "Dung Lượng Pin", value: `${specs.battery_power}mAh` },
        { label: "Thời Gian Thuyết Trình", value: `${specs.talk_time}h` },
        { label: "4G", value: specs.four_g ? "Có" : "Không" },
        { label: "3G", value: specs.three_g ? "Có" : "Không" },
        { label: "WiFi", value: specs.wifi ? "Có" : "Không" },
        { label: "Bluetooth", value: specs.blue ? "Có" : "Không" },
        { label: "Dual SIM", value: specs.dual_sim ? "Có" : "Không" },
      ],
    },
    {
      title: "Kích Thước & Trọng Lượng",
      items: [
        { label: "Trọng Lượng", value: `${specs.mobile_wt}g` },
        { label: "Độ Dày", value: `${specs.m_dep}mm` },
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {specGroups.map((group) => (
        <div key={group.title} className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">{group.title}</h3>
          <div className="space-y-3">
            {group.items.map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
