/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seed a realistic set of blog posts (bilingual vi/en) so the /blog list can be
 * exercised with a professional featured + grid + pagination + category-filter UI.
 *
 * Idempotent: every seeded category/post uses a deterministic UUID, so re-running
 * replaces the previous seed instead of duplicating it.
 *
 * Run:  npx tsx scripts/seed-blog.ts
 * Needs DATABASE_URL (defaults to the local Supabase Postgres).
 */
import { Client } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const AUTHOR_ID = "00000000-0000-0000-0000-000000000001";

// Cover media assets already present in the catalog (real Unsplash photos).
const COVERS = [
  "00000000-0000-0000-0000-000000000011",
  "00000000-0000-0000-0000-000000000012",
  "00000000-0000-0000-0000-000000000013",
  "00000000-0000-0000-0000-000000000014",
  "00000000-0000-0000-0000-000000000015",
  "00000000-0000-0000-0000-000000000016",
  "00000000-0000-0000-0000-000000000017",
];
const SECTION_IMG = [
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
];

type Cat = { id: string; slug: string; nameVi: string; nameEn: string; descVi: string; descEn: string };

const WOOD_CAT_ID = "3f9d647a-2cb5-453c-9c70-2601406c5c85"; // existing "Kiến thức đồ gỗ"

const CATEGORIES: Cat[] = [
  { id: WOOD_CAT_ID, slug: "kien-thuc-do-go", nameVi: "Kiến thức đồ gỗ", nameEn: "Wood knowledge", descVi: "Hiểu về gỗ tự nhiên, cách chọn và bảo quản.", descEn: "Understanding natural wood, selection and care." },
  { id: "c1a00000-0000-4000-8000-000000000001", slug: "thiet-bi-ve-sinh", nameVi: "Thiết bị vệ sinh & Wellness", nameEn: "Sanitary & Wellness", descVi: "Không gian phòng tắm tiện nghi, hiện đại.", descEn: "Comfortable, modern bathroom spaces." },
  { id: "c1a00000-0000-4000-8000-000000000002", slug: "gach-op-lat", nameVi: "Gạch ốp lát & Vật liệu", nameEn: "Tiles & Materials", descVi: "Chọn và phối vật liệu bề mặt hoàn thiện.", descEn: "Choosing and pairing finishing surfaces." },
  { id: "c1a00000-0000-4000-8000-000000000003", slug: "xu-huong-noi-that", nameVi: "Xu hướng nội thất", nameEn: "Interior trends", descVi: "Cảm hứng thiết kế và xu hướng mới.", descEn: "Design inspiration and new trends." },
  { id: "c1a00000-0000-4000-8000-000000000004", slug: "kinh-nghiem-chon-mua", nameVi: "Kinh nghiệm chọn mua", nameEn: "Buying guides", descVi: "Lời khuyên thực tế trước khi xuống tiền.", descEn: "Practical advice before you buy." },
];

type Section = { id: string; titleVi: string; titleEn: string; bodyVi: string; bodyEn: string; image?: string };
type Post = {
  n: number;
  catId: string;
  cover: number;
  daysAgo: number;
  featured: boolean;
  slug: string;
  titleVi: string; titleEn: string;
  excerptVi: string; excerptEn: string;
  takeaways: { vi: string; en: string }[];
  quoteVi: string; quoteEn: string;
  sections: Section[];
};

const P = (
  n: number, catId: string, cover: number, daysAgo: number, featured: boolean, slug: string,
  titleVi: string, titleEn: string, excerptVi: string, excerptEn: string,
  takeaways: [string, string][], quoteVi: string, quoteEn: string, sections: Section[],
): Post => ({
  n, catId, cover, daysAgo, featured, slug, titleVi, titleEn, excerptVi, excerptEn,
  takeaways: takeaways.map(([vi, en]) => ({ vi, en })), quoteVi, quoteEn, sections,
});

const sec = (id: string, tVi: string, tEn: string, bVi: string, bEn: string, image?: string): Section =>
  ({ id, titleVi: tVi, titleEn: tEn, bodyVi: bVi, bodyEn: bEn, image });

const POSTS: Post[] = [
  P(1, WOOD_CAT_ID, 0, 3, true, "bi-quyet-bao-quan-do-go-oc-cho",
    "Bí quyết bảo quản đồ gỗ óc chó bền đẹp theo năm tháng",
    "How to keep walnut furniture beautiful for years",
    "Gỗ óc chó cao cấp cần được chăm sóc đúng cách để giữ màu và độ bền. Đây là những nguyên tắc bảo quản cốt lõi.",
    "Premium walnut needs proper care to keep its color and durability. Here are the core maintenance principles.",
    [["Tránh ánh nắng trực tiếp và nguồn nhiệt", "Avoid direct sunlight and heat sources"],
     ["Giữ độ ẩm phòng ổn định 40–60%", "Keep room humidity stable at 40–60%"],
     ["Lau bằng khăn mềm, hạn chế hóa chất mạnh", "Wipe with a soft cloth, avoid harsh chemicals"]],
    "Một món đồ gỗ tốt phải giữ được nhịp sống của gia đình trong nhiều năm.",
    "A good wooden piece should keep pace with family life for years.",
    [sec("do-am", "Kiểm soát độ ẩm", "Humidity control",
        "Gỗ tự nhiên co giãn theo độ ẩm môi trường. Duy trì độ ẩm ổn định giúp hạn chế cong vênh, nứt nẻ và giữ các mối ghép chắc chắn qua các mùa.",
        "Natural wood expands and contracts with ambient humidity. Stable humidity limits warping, cracking and keeps joints tight across seasons.", SECTION_IMG[0]),
     sec("ve-sinh", "Vệ sinh đúng cách", "Cleaning the right way",
        "Dùng khăn cotton ẩm vắt kiệt, lau theo vân gỗ. Tránh nước đọng và dung dịch tẩy mạnh vì chúng phá lớp dầu bảo vệ bề mặt.",
        "Use a well-wrung cotton cloth and wipe along the grain. Avoid standing water and strong solvents that strip the protective oil finish."),
     sec("phuc-hoi", "Phục hồi bề mặt", "Refreshing the surface",
        "Sau 6–12 tháng, thoa lại một lớp dầu lau gỗ mỏng để làm sâu màu vân và bảo vệ thớ gỗ khỏi khô.",
        "Every 6–12 months, apply a thin coat of finishing oil to deepen the grain and protect the fibers from drying out.")]),

  P(2, WOOD_CAT_ID, 1, 9, false, "phan-biet-go-tu-nhien-va-go-cong-nghiep",
    "Phân biệt gỗ tự nhiên và gỗ công nghiệp khi chọn nội thất",
    "Natural wood vs. engineered wood for furniture",
    "Mỗi loại vật liệu có ưu nhược riêng. Hiểu đúng giúp bạn chọn đúng ngân sách và công năng.",
    "Each material has trade-offs. Understanding them helps you match budget and function.",
    [["Gỗ tự nhiên bền, giá cao, vân độc bản", "Solid wood is durable, premium, uniquely grained"],
     ["Gỗ công nghiệp ổn định, đa dạng bề mặt", "Engineered wood is stable with varied finishes"],
     ["Xét độ ẩm khu vực sử dụng trước khi chọn", "Consider the room's humidity before choosing"]],
    "Không có vật liệu tốt nhất — chỉ có vật liệu phù hợp nhất với không gian của bạn.",
    "There is no best material — only the one best suited to your space.",
    [sec("ket-cau", "Kết cấu và độ bền", "Structure and durability",
        "Gỗ tự nhiên nguyên khối chịu lực và tuổi thọ cao, có thể chà nhám phục hồi nhiều lần. Gỗ công nghiệp lõi MDF/HDF ổn định kích thước nhưng khó phục hồi khi hư hại nặng.",
        "Solid wood carries load well and lasts decades, and can be sanded back repeatedly. MDF/HDF cores are dimensionally stable but hard to restore after heavy damage.", SECTION_IMG[1]),
     sec("chi-phi", "Chi phí và thẩm mỹ", "Cost and aesthetics",
        "Gỗ tự nhiên có vân độc bản, giá cao hơn. Gỗ công nghiệp phủ veneer/laminate cho bề mặt đồng đều, nhiều màu, tối ưu ngân sách.",
        "Solid wood offers one-of-a-kind grain at a premium. Veneer/laminate surfaces give consistent color options and better value.")]),

  P(3, "c1a00000-0000-4000-8000-000000000001", 2, 14, false, "thiet-ke-phong-tam-nho-tien-nghi",
    "Thiết kế phòng tắm nhỏ vẫn tiện nghi và sang trọng",
    "Designing a small bathroom that still feels luxurious",
    "Diện tích hạn chế không đồng nghĩa với thiếu tiện nghi. Vài nguyên tắc bố trí giúp phòng tắm nhỏ thoáng và sang.",
    "Limited space doesn't mean less comfort. A few layout principles make a small bathroom feel airy and refined.",
    [["Ưu tiên thiết bị treo tường để lộ sàn", "Prefer wall-hung fixtures to expose the floor"],
     ["Dùng kính trong suốt chia khu ướt/khô", "Use clear glass to split wet and dry zones"],
     ["Chọn gạch khổ lớn, ít ron", "Choose large-format tiles with fewer grout lines"]],
    "Một phòng tắm được quy hoạch tốt mang lại cảm giác thư giãn mỗi ngày.",
    "A well-planned bathroom delivers a moment of calm every day.",
    [sec("bo-tri", "Bố trí thông minh", "Smart layout",
        "Đặt lavabo và bồn cầu treo tường để tăng diện tích sàn thị giác. Gương lớn phản chiếu ánh sáng làm phòng rộng hơn.",
        "Wall-hung basin and toilet expand the visual floor area. A large mirror bounces light to enlarge the room.", SECTION_IMG[2]),
     sec("vat-lieu", "Vật liệu và ánh sáng", "Materials and light",
        "Tông sáng, gạch bóng nhẹ và đèn ấm tạo chiều sâu. Vòi sen âm tường giúp không gian gọn gàng, dễ vệ sinh.",
        "Light tones, softly glossy tiles and warm lighting add depth. Concealed shower valves keep things tidy and easy to clean.")]),

  P(4, "c1a00000-0000-4000-8000-000000000001", 3, 20, false, "chon-thiet-bi-ve-sinh-tiet-kiem-nuoc",
    "Chọn thiết bị vệ sinh tiết kiệm nước cho gia đình",
    "Choosing water-saving sanitary ware for your home",
    "Thiết bị tiết kiệm nước giảm hóa đơn mà vẫn đảm bảo trải nghiệm. Đây là các thông số cần lưu ý.",
    "Water-saving fixtures cut bills without sacrificing experience. Here are the specs to watch.",
    [["Bồn cầu xả 2 chế độ 3/4.5 lít", "Dual-flush toilets at 3/4.5 litres"],
     ["Vòi có bộ sục khí giảm lưu lượng", "Aerated faucets that reduce flow"],
     ["Sen tắm đạt chuẩn lưu lượng hợp lý", "Showerheads with sensible flow ratings"]],
    "Tiết kiệm nước là khoản đầu tư sinh lời đều đặn theo thời gian.",
    "Saving water is an investment that pays back steadily over time.",
    [sec("bon-cau", "Bồn cầu hai chế độ xả", "Dual-flush toilets",
        "Cơ chế xả 3/4.5 lít cho phép chọn lượng nước phù hợp, tiết kiệm hàng nghìn lít mỗi năm so với bồn cầu cũ.",
        "A 3/4.5-litre mechanism lets you match the water used, saving thousands of litres a year versus older toilets."),
     sec("voi-sen", "Vòi và sen tiết kiệm", "Efficient faucets and showers",
        "Bộ sục khí trộn không khí vào dòng nước, giữ cảm giác mạnh mà giảm lưu lượng thực tế. Ưu tiên sản phẩm có chứng nhận rõ ràng.",
        "Aerators mix air into the stream to keep a strong feel while lowering real flow. Prefer products with clear certifications.")]),

  P(5, "c1a00000-0000-4000-8000-000000000002", 4, 26, false, "cach-phoi-gach-op-lat-hai-hoa",
    "Cách phối gạch ốp lát hài hòa cho không gian sống",
    "How to pair tiles harmoniously in living spaces",
    "Phối gạch đúng tạo chiều sâu và sự sang trọng. Nguyên tắc tỷ lệ, màu và chất bề mặt cần cân nhắc.",
    "The right tile pairing adds depth and elegance. Consider proportion, color and surface texture.",
    [["Giới hạn 2–3 loại vật liệu chủ đạo", "Limit to 2–3 dominant materials"],
     ["Kết hợp bề mặt nhám và bóng có chủ đích", "Mix matte and gloss with intention"],
     ["Dùng gạch khổ lớn cho không gian rộng", "Use large formats in bigger rooms"]],
    "Vật liệu bề mặt là nền tảng thầm lặng cho mọi thiết kế nội thất.",
    "Surface materials are the quiet foundation of every interior.",
    [sec("ty-le", "Tỷ lệ và bố cục", "Proportion and layout",
        "Gạch khổ lớn giảm số đường ron, tạo cảm giác liền mạch. Với khu vực nhỏ, chọn khổ vừa để tránh nhiều mạch cắt.",
        "Large formats reduce grout lines for a seamless look. In small areas, pick medium sizes to avoid excessive cuts.", SECTION_IMG[0]),
     sec("mau-be-mat", "Màu và chất bề mặt", "Color and texture",
        "Kết hợp một tông trung tính làm nền và một điểm nhấn vân đá hoặc bề mặt nhám để tạo tương phản tinh tế.",
        "Combine a neutral base with a stone-veined or matte accent to create a refined contrast.")]),

  P(6, "c1a00000-0000-4000-8000-000000000002", 5, 33, false, "gach-porcelain-hay-ceramic",
    "Gạch porcelain hay ceramic: nên chọn loại nào?",
    "Porcelain or ceramic tiles: which should you choose?",
    "Hai dòng gạch phổ biến với đặc tính khác nhau về độ hút nước và độ bền. Chọn đúng theo khu vực sử dụng.",
    "Two common tile families differ in water absorption and durability. Choose by where they'll be used.",
    [["Porcelain hút nước thấp, bền hơn", "Porcelain absorbs less water, more durable"],
     ["Ceramic giá tốt cho khu vực khô", "Ceramic offers value for dry areas"],
     ["Xét độ chống trơn cho sàn ướt", "Check slip rating for wet floors"]],
    "Chọn đúng loại gạch là chọn đúng tuổi thọ cho công trình.",
    "Choosing the right tile is choosing the right lifespan for the build.",
    [sec("hut-nuoc", "Độ hút nước", "Water absorption",
        "Porcelain nung ở nhiệt độ cao, độ hút nước dưới 0,5%, phù hợp khu vực ẩm và ngoài trời. Ceramic hút nước cao hơn, hợp tường và sàn khô.",
        "Porcelain is fired hotter with under 0.5% absorption, suited to wet and outdoor areas. Ceramic absorbs more, best for dry walls and floors."),
     sec("do-ben", "Độ bền và chi phí", "Durability and cost",
        "Porcelain cứng, chịu mài mòn tốt nên chi phí cao hơn. Ceramic nhẹ, dễ cắt và tiết kiệm cho hạng mục ít chịu lực.",
        "Porcelain is harder and abrasion-resistant at a higher cost. Ceramic is lighter, easy to cut and economical for low-traffic uses.")]),

  P(7, "c1a00000-0000-4000-8000-000000000003", 6, 40, true, "xu-huong-noi-that-2026",
    "Xu hướng nội thất 2026: ấm áp, tự nhiên và bền vững",
    "2026 interior trends: warm, natural and sustainable",
    "Năm 2026 đề cao vật liệu tự nhiên, tông màu ấm và thiết kế bền vững. Cùng điểm qua các hướng nổi bật.",
    "2026 favors natural materials, warm palettes and sustainable design. Here are the standout directions.",
    [["Tông đất và gỗ ấm lên ngôi", "Earthy tones and warm woods rise"],
     ["Vật liệu tái chế, thân thiện môi trường", "Recycled, eco-friendly materials"],
     ["Không gian đa công năng linh hoạt", "Flexible multi-function spaces"]],
    "Xu hướng bền vững không phải trào lưu — đó là cách sống có trách nhiệm.",
    "Sustainability isn't a fad — it's a responsible way of living.",
    [sec("mau-sac", "Bảng màu ấm", "Warm palettes",
        "Các tông nâu đất, terracotta và xanh rêu trầm tạo cảm giác gần gũi, dễ kết hợp với gỗ tự nhiên và đá.",
        "Earthy browns, terracotta and muted greens feel grounded and pair easily with natural wood and stone.", SECTION_IMG[1]),
     sec("ben-vung", "Thiết kế bền vững", "Sustainable design",
        "Ưu tiên vật liệu có nguồn gốc rõ ràng, độ bền cao và khả năng tái sử dụng, giảm thay mới và lãng phí.",
        "Prioritize traceable, durable and reusable materials to reduce replacement and waste.")]),

  P(8, "c1a00000-0000-4000-8000-000000000003", 0, 48, false, "anh-sang-trong-thiet-ke-noi-that",
    "Vai trò của ánh sáng trong thiết kế nội thất",
    "The role of lighting in interior design",
    "Ánh sáng định hình cảm xúc không gian. Kết hợp ba lớp sáng giúp căn phòng vừa chức năng vừa ấm cúng.",
    "Lighting shapes the mood of a space. Three lighting layers make a room both functional and cozy.",
    [["Kết hợp sáng nền, sáng điểm, sáng nhấn", "Blend ambient, task and accent light"],
     ["Nhiệt độ màu ấm cho khu thư giãn", "Warm color temperature for relaxing zones"],
     ["Tận dụng tối đa ánh sáng tự nhiên", "Maximize natural daylight"]],
    "Ánh sáng tốt khiến vật liệu đẹp kể được câu chuyện của nó.",
    "Good lighting lets beautiful materials tell their story.",
    [sec("ba-lop", "Ba lớp ánh sáng", "Three lighting layers",
        "Sáng nền phủ đều không gian, sáng điểm phục vụ công việc, sáng nhấn tôn vật liệu và tác phẩm. Cân bằng ba lớp tạo chiều sâu.",
        "Ambient light fills the room, task light supports activities, accent light highlights materials and art. Balancing all three adds depth."),
     sec("nhiet-do-mau", "Nhiệt độ màu", "Color temperature",
        "2700–3000K cho phòng ngủ, phòng khách ấm cúng; 3500–4000K cho bếp và khu làm việc cần độ trung thực màu.",
        "2700–3000K for cozy bedrooms and living rooms; 3500–4000K for kitchens and workspaces needing color accuracy.")]),

  P(9, "c1a00000-0000-4000-8000-000000000004", 1, 55, false, "kinh-nghiem-do-kich-thuoc-noi-that",
    "Kinh nghiệm đo kích thước trước khi mua nội thất",
    "How to measure your space before buying furniture",
    "Đo đạc chính xác tránh mua sai kích thước. Vài mẹo giúp bạn hình dung món đồ trong không gian thật.",
    "Accurate measuring avoids sizing mistakes. A few tips help you picture a piece in the real space.",
    [["Đo cả lối đi và cửa vào", "Measure walkways and doorways too"],
     ["Dán băng keo mô phỏng kích thước", "Tape out the footprint on the floor"],
     ["Chừa khoảng trống công năng hợp lý", "Leave sensible clearance around pieces"]],
    "Mười phút đo đạc tiết kiệm hàng giờ đổi trả và hối tiếc.",
    "Ten minutes measuring saves hours of returns and regret.",
    [sec("loi-di", "Lối đi và cửa", "Walkways and doors",
        "Đảm bảo món đồ đi lọt cửa, hành lang và thang máy. Ghi lại chiều rộng nhỏ nhất trên đường vận chuyển.",
        "Make sure the piece fits through doors, hallways and elevators. Note the narrowest width along the delivery path."),
     sec("khoang-trong", "Khoảng trống công năng", "Functional clearance",
        "Chừa 60–90cm cho lối đi chính, 30–45cm giữa sofa và bàn trà để không gian thoải mái khi sử dụng.",
        "Allow 60–90cm for main walkways and 30–45cm between sofa and coffee table for comfortable use.")]),

  P(10, "c1a00000-0000-4000-8000-000000000004", 2, 63, false, "chon-sofa-phu-hop-phong-khach",
    "Chọn sofa phù hợp với phòng khách của bạn",
    "Choosing the right sofa for your living room",
    "Sofa là tâm điểm phòng khách. Chọn đúng kích thước, chất liệu và kiểu dáng theo nhu cầu sử dụng.",
    "The sofa anchors the living room. Match size, material and style to how you live.",
    [["Cân đối kích thước với diện tích phòng", "Balance size with room dimensions"],
     ["Chọn chất liệu bọc theo lối sống", "Pick upholstery by lifestyle"],
     ["Thử độ sâu ngồi trước khi quyết định", "Test seat depth before deciding"]],
    "Chiếc sofa đúng là nơi cả gia đình muốn quay về mỗi tối.",
    "The right sofa is where the whole family wants to gather each evening.",
    [sec("kich-thuoc", "Kích thước và tỷ lệ", "Size and proportion",
        "Sofa nên chiếm khoảng hai phần ba chiều dài tường chính. Quá lớn gây bí, quá nhỏ làm phòng mất cân đối.",
        "A sofa should span about two-thirds of the main wall. Too big feels cramped; too small unbalances the room.", SECTION_IMG[2]),
     sec("chat-lieu", "Chất liệu bọc", "Upholstery material",
        "Nhà có trẻ nhỏ hoặc thú cưng nên chọn vải chống bẩn hoặc da dễ lau. Vải nỉ ấm áp hợp không gian thư giãn.",
        "Homes with kids or pets suit stain-resistant fabric or wipeable leather. Cozy weaves fit relaxed spaces.")]),

  P(11, WOOD_CAT_ID, 3, 70, false, "y-nghia-van-go-trong-noi-that",
    "Ý nghĩa của vân gỗ trong thiết kế nội thất cao cấp",
    "The meaning of wood grain in premium interiors",
    "Vân gỗ không chỉ là thẩm mỹ mà còn phản ánh nguồn gốc và cách xẻ gỗ. Hiểu vân giúp chọn món đồ giá trị.",
    "Grain is more than looks — it reflects origin and how the log was cut. Reading it helps you choose value.",
    [["Vân thẳng sang trọng, ổn định", "Straight grain reads refined and stable"],
     ["Vân núi tạo điểm nhấn nghệ thuật", "Cathedral grain adds artistic focus"],
     ["Cách xẻ ảnh hưởng độ bền và giá", "Cut method affects durability and price"]],
    "Mỗi tấm gỗ mang một dấu vân độc bản không thể lặp lại.",
    "Every board carries a unique grain that can never be repeated.",
    [sec("cach-xe", "Cách xẻ gỗ", "Cutting methods",
        "Xẻ tiếp tuyến cho vân núi rộng, giá tốt; xẻ xuyên tâm cho vân thẳng đều, ổn định kích thước và cao cấp hơn.",
        "Plain-sawn yields wide cathedral grain at good value; quarter-sawn gives straight, stable, more premium grain."),
     sec("tham-my", "Giá trị thẩm mỹ", "Aesthetic value",
        "Nghệ nhân chọn và ghép vân để mặt bàn, cánh tủ hài hòa như một tác phẩm liền mạch.",
        "Craftspeople select and match grain so tabletops and doors read as one seamless artwork.")]),

  P(12, "c1a00000-0000-4000-8000-000000000001", 4, 78, false, "bo-tri-phong-tam-wellness",
    "Bố trí phòng tắm wellness thư giãn tại gia",
    "Creating a wellness bathroom to relax at home",
    "Phòng tắm wellness biến sinh hoạt hằng ngày thành trải nghiệm chăm sóc bản thân. Bắt đầu từ những chi tiết nhỏ.",
    "A wellness bathroom turns daily routines into self-care. Start with the small details.",
    [["Bồn tắm và sen mưa cho thư giãn", "Soaking tub and rain shower to unwind"],
     ["Vật liệu tự nhiên, tông trầm dịu", "Natural materials, calming tones"],
     ["Ánh sáng ấm và thông gió tốt", "Warm light and good ventilation"]],
    "Chăm sóc bản thân bắt đầu từ không gian khiến bạn muốn chậm lại.",
    "Self-care starts with a space that makes you want to slow down.",
    [sec("thiet-bi", "Thiết bị trọng tâm", "Signature fixtures",
        "Một bồn tắm ngâm và sen mưa lưu lượng lớn là trung tâm thư giãn. Kết hợp vòi nhiệt độ ổn định để an toàn và tiện lợi.",
        "A soaking tub and generous rain shower anchor relaxation. Pair with thermostatic valves for safety and ease.", SECTION_IMG[0]),
     sec("khong-khi", "Cảm giác không gian", "Atmosphere",
        "Đá tự nhiên, gỗ chịu ẩm và cây xanh nhỏ tạo cảm giác spa. Thông gió tốt giữ bề mặt khô và bền.",
        "Natural stone, moisture-tolerant wood and small plants evoke a spa. Good ventilation keeps surfaces dry and durable.")]),

  P(13, "c1a00000-0000-4000-8000-000000000002", 5, 86, false, "bao-tri-be-mat-da-marble",
    "Bảo trì bề mặt đá marble luôn sáng bóng",
    "Keeping marble surfaces bright and polished",
    "Đá marble sang trọng nhưng nhạy cảm với axit và vết bẩn. Chăm sóc đúng giúp giữ vẻ đẹp lâu dài.",
    "Marble is luxurious but sensitive to acids and stains. Proper care preserves its beauty.",
    [["Lau ngay khi đổ chất lỏng có axit", "Wipe acidic spills immediately"],
     ["Dùng chất tẩy trung tính pH", "Use pH-neutral cleaners"],
     ["Phủ chất chống thấm định kỳ", "Reseal periodically"]],
    "Đá đẹp cần sự chăm sóc nhẹ nhàng nhưng đều đặn.",
    "Beautiful stone needs gentle but consistent care.",
    [sec("chong-tham", "Chống thấm định kỳ", "Sealing routine",
        "Phủ lớp chống thấm 6–12 tháng một lần để giảm hấp thụ vết bẩn và dầu mỡ trên bề mặt xốp của đá.",
        "Apply a sealer every 6–12 months to reduce absorption of stains and oils into the porous surface."),
     sec("ve-sinh-da", "Vệ sinh hằng ngày", "Daily cleaning",
        "Tránh giấm, chanh và chất tẩy mạnh vì axit ăn mòn bề mặt. Dùng khăn mềm và dung dịch trung tính.",
        "Avoid vinegar, lemon and harsh cleaners — acids etch the surface. Use a soft cloth and neutral solution.")]),

  P(14, "c1a00000-0000-4000-8000-000000000003", 6, 95, false, "toi-gian-am-phong-cach-noi-that",
    "Tối giản ấm: phong cách nội thất được yêu thích",
    "Warm minimalism: a beloved interior style",
    "Tối giản ấm giữ sự gọn gàng nhưng thêm chất liệu và tông ấm để không gian không lạnh lẽo.",
    "Warm minimalism keeps things clean while adding texture and warmth so a space never feels cold.",
    [["Ít món nhưng chất lượng cao", "Fewer pieces, higher quality"],
     ["Chất liệu tự nhiên tạo chiều sâu", "Natural textures add depth"],
     ["Tông màu ấm, trung tính", "Warm, neutral palette"]],
    "Tối giản không phải là trống rỗng — đó là chọn lọc những gì thực sự quan trọng.",
    "Minimalism isn't emptiness — it's choosing what truly matters.",
    [sec("chat-lieu-am", "Chất liệu ấm", "Warm textures",
        "Gỗ, len, mây tre và vải thô thêm chiều sâu cho không gian tối giản, tránh cảm giác lạnh và đơn điệu.",
        "Wood, wool, rattan and raw textiles add depth to minimal spaces and avoid a cold, flat feeling.", SECTION_IMG[1]),
     sec("chon-loc", "Chọn lọc đồ đạc", "Curated pieces",
        "Đầu tư vào vài món chất lượng, bền và ý nghĩa thay vì lấp đầy phòng bằng nhiều món rẻ.",
        "Invest in a few quality, durable and meaningful pieces instead of filling a room with cheap items.")]),

  P(15, "c1a00000-0000-4000-8000-000000000004", 0, 104, false, "checklist-nghiem-thu-noi-that",
    "Checklist nghiệm thu nội thất khi nhận bàn giao",
    "A furniture handover inspection checklist",
    "Nghiệm thu kỹ lúc nhận hàng tránh tranh chấp về sau. Đây là những hạng mục quan trọng cần kiểm tra.",
    "A careful handover inspection prevents disputes later. Here are the key items to check.",
    [["Kiểm tra bề mặt, mối ghép, bản lề", "Check surfaces, joints and hinges"],
     ["Đối chiếu đúng mẫu và kích thước đặt", "Verify model and ordered dimensions"],
     ["Ghi nhận lỗi bằng ảnh trước khi ký", "Document defects with photos before signing"]],
    "Nghiệm thu cẩn thận là cách bảo vệ khoản đầu tư của bạn.",
    "A careful inspection is how you protect your investment.",
    [sec("be-mat", "Bề mặt và cơ cấu", "Surfaces and mechanisms",
        "Kiểm tra vết xước, cấn móp, độ phẳng mặt bàn và hoạt động của ngăn kéo, bản lề, ray trượt.",
        "Inspect scratches, dents, tabletop flatness and the operation of drawers, hinges and slides."),
     sec("doi-chieu", "Đối chiếu đơn hàng", "Match the order",
        "So sánh mã sản phẩm, màu, kích thước với hợp đồng. Ghi lại mọi sai lệch kèm ảnh trước khi ký biên bản.",
        "Compare product code, color and size against the contract. Note any discrepancy with photos before signing.")]),

  P(16, WOOD_CAT_ID, 1, 112, false, "go-oc-cho-vi-sao-duoc-ua-chuong",
    "Gỗ óc chó: vì sao được ưa chuộng trong nội thất cao cấp",
    "Why walnut is prized in premium furniture",
    "Gỗ óc chó nổi bật với màu trầm ấm, vân đẹp và độ bền. Đây là lý do nó được giới thiết kế yêu thích.",
    "Walnut stands out for its warm tone, gorgeous grain and durability. Here's why designers love it.",
    [["Màu nâu trầm ấm, sang trọng", "Warm, refined brown tone"],
     ["Vân đa dạng, dễ chế tác", "Varied grain, workable for craft"],
     ["Độ bền và ổn định cao", "Strong and dimensionally stable"]],
    "Gỗ óc chó chinh phục bằng sự trầm ấm mà vẫn tinh tế.",
    "Walnut wins hearts with warmth that stays refined.",
    [sec("dac-tinh", "Đặc tính nổi bật", "Signature traits",
        "Óc chó có độ cứng vừa phải, dễ tạo hình và chạm khắc, đồng thời ổn định kích thước tốt qua thời gian.",
        "Walnut has moderate hardness, easy to shape and carve, while staying dimensionally stable over time.", SECTION_IMG[2]),
     sec("ung-dung", "Ứng dụng thiết kế", "Design applications",
        "Từ bàn ăn, tủ đến giường ngủ, óc chó nâng tầm không gian với vẻ ấm áp và chiều sâu tự nhiên.",
        "From dining tables to cabinets and beds, walnut elevates spaces with warmth and natural depth.")]),
];

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");

    // 1) Categories — insert/keep as DRAFT first, add translations, THEN publish.
    // A DB trigger (require_publish_translations) refuses to publish before both
    // vi + en translations exist, so ordering matters.
    for (const c of CATEGORIES) {
      await client.query(
        `INSERT INTO blog_categories (id, status, sort_order, published_at)
         VALUES ($1, 'draft', $2, NULL)
         ON CONFLICT (id) DO UPDATE SET status='draft', published_at=NULL, sort_order=EXCLUDED.sort_order`,
        [c.id, CATEGORIES.indexOf(c)],
      );
      for (const loc of ["vi", "en"] as const) {
        await client.query(
          `INSERT INTO blog_category_translations (category_id, locale, slug, name, description)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (category_id, locale) DO UPDATE SET slug=EXCLUDED.slug, name=EXCLUDED.name, description=EXCLUDED.description`,
          [c.id, loc, c.slug, loc === "vi" ? c.nameVi : c.nameEn, loc === "vi" ? c.descVi : c.descEn],
        );
      }
      await client.query(
        `UPDATE blog_categories SET status='published', published_at=COALESCE(published_at, now()) WHERE id=$1`,
        [c.id],
      );
    }

    // 2) Posts + translations (deterministic ids: a1a00000-...-NN)
    const seededIds: string[] = [];
    for (const p of POSTS) {
      const id = `a1a00000-0000-4000-8000-0000000000${String(p.n).padStart(2, "0")}`;
      seededIds.push(id);
      // Ensure the post is DRAFT before touching translations (a published post
      // must keep its translations, so we can't delete them while published).
      await client.query(
        `INSERT INTO blog_posts (id, category_id, author_id, cover_media_id, status, featured, published_at)
         VALUES ($1,$2,$3,$4,'draft',$5,NULL)
         ON CONFLICT (id) DO UPDATE SET status='draft', category_id=EXCLUDED.category_id, cover_media_id=EXCLUDED.cover_media_id,
           featured=EXCLUDED.featured, published_at=NULL, deleted_at=NULL`,
        [id, p.catId, AUTHOR_ID, COVERS[p.cover % COVERS.length], p.featured],
      );
      await client.query(`DELETE FROM blog_post_translations WHERE post_id=$1`, [id]);
      for (const loc of ["vi", "en"] as const) {
        const body = {
          takeaways: p.takeaways,
          quote: { vi: p.quoteVi, en: p.quoteEn },
          sections: p.sections.map((s) => ({
            id: s.id,
            title: { vi: s.titleVi, en: s.titleEn },
            body: { vi: s.bodyVi, en: s.bodyEn },
            ...(s.image ? { image: s.image } : {}),
          })),
        };
        await client.query(
          `INSERT INTO blog_post_translations (post_id, locale, slug, title, excerpt, body_json)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, loc, p.slug, loc === "vi" ? p.titleVi : p.titleEn, loc === "vi" ? p.excerptVi : p.excerptEn, body],
        );
      }
      // Publish now that both translations exist.
      await client.query(
        `UPDATE blog_posts SET status='published', published_at=$2 WHERE id=$1`,
        [id, iso(p.daysAgo)],
      );
    }

    await client.query("COMMIT");
    console.log(`Seeded ${POSTS.length} blog posts across ${CATEGORIES.length} categories.`);
    console.log(`Seeded post ids: ${seededIds[0]} .. ${seededIds[seededIds.length - 1]}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Seed failed, rolled back:", e);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
