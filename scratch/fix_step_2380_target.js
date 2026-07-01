const fs = require('fs');

const filePath = 'scratch/step_2380_code.txt';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// Locate: const promoStatesTarget = `...`;
const token = 'const promoStatesTarget = `';
const startIdx = content.indexOf(token);
if (startIdx === -1) {
  console.error("Token not found!");
  process.exit(1);
}

const endIdx = content.indexOf('`;\n\nconst promoStatesReplacement = `', startIdx);
if (endIdx === -1) {
  console.error("End index not found!");
  process.exit(1);
}

// The original states list from clean file:
const cleanOriginalStates = `  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([""]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);`;

content = content.substring(0, startIdx + token.length) + cleanOriginalStates + content.substring(endIdx);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully fixed promoStatesTarget in step_2380_code.txt!");
