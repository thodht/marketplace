export type Lang = "en" | "zh" | "ru" | "vi";

export const LANG_NAMES: Record<Lang, string> = {
    en: "English",
    zh: "中文",
    ru: "Русский",
    vi: "Tiếng Việt",
};

// 1. Strictly define keys for full compile-time autocomplete and safety
export interface AppDictionary {
    // Categories
    "electronics": string,
    "fashion": string,
    "vehicles": string,
    "food": string,
    "services": string,
    "others": string,

    // General
    "auth.loading": string,
    "auth.retry": string,
    "app.name": string,
    "button.edit": string,
    "location.holder": string,
    "location.none": string,
    "search.holder": string,

    // Onboarding
    "auth.login": string,
    "onboarding.choose.lang": string,
    "onboarding.name": string,
    "onboarding.name.holder": string,
    "onboarding.name.info": string,
    "onboarding.confirm.heading": string,
    "onboarding.confirm.message": string,
    "onboarding.confirm": string,
    "onboarding.cancel": string,
    "onboarding.continue": string,
    "onboarding.remind": string,
    "onboarding.unknown.error": string,
    "onboarding.name.error": string,
    "onboarding.name.warning": string,

    // Notification
    "notification.heading": string,
    "notification.mark.read": string,
    "notification.none": string,

    // Listing
    "new.listing.heading": string,
    "new.listing.name": string,
    "new.listing.name.holder": string,
    "new.listing.price": string,
    "new.listing.count": string,
    "new.listing.desc": string,
    "new.listing.desc.holder": string,
    "new.listing.image.heading": string,
    "new.listing.upload.desc": string,
    "new.listing.upload.exceeding": string,
    "new.listing.cancel": string,
    "new.listing.publish": string,
    "new.listing.publishing": string,
    "new.listing.discard.heading": string,
    "new.listing.discard.msg": string,
    "new.listing.discard": string,
    "new.listing.continue": string,
    "new.listing.error01": string,
    "new.listing.error02": string,
    "category.heading": string,
    "category.none": string,
    "listing.heading": string,
    "listing.view.all": string,
}


const en: AppDictionary = {
    // Categories
    "electronics": "Electronics",
    "fashion": "Fashion",
    "vehicles": "Vehicles",
    "food": "Food",
    "services": "Services",
    "others": "Others",

    // General
    "auth.loading": "Pi Network Authentication",
    "auth.retry": "Try Again",
    "app.name": "Marketplace",
    "button.edit": "Edit",
    "location.holder": "Search location...",
    "location.none": "Set your location",
    "search.holder": "Search products near you...",

    // Onboarding
    "auth.login": "Please log in through the Pi Browser.",
    "onboarding.choose.lang": "Choose Your Language",
    "onboarding.name": "Your Name",
    "onboarding.name.holder": "Input your nname...",
    "onboarding.name.info": "Your display name can only be set once and cannot be changed later.",
    "onboarding.confirm.heading": "Confirm Display Name",
    "onboarding.confirm.message": "Your name can only set once, is your name",
    "onboarding.confirm": "Confirm",
    "onboarding.cancel": "Cancel",
    "onboarding.continue": "Continue",
    "onboarding.remind": "You can change your language anytime from your Profile.",
    "onboarding.unknown.error": "Something went wrong, please try again.",
    "onboarding.name.error": "Please enter your display name.",
    "onboarding.name.warning": "Name must have at least 2 characters.",

    // Notification
    "notification.heading": "Notification",
    "notification.mark.read": "",
    "notification.none": "No notifications yet.",

    // Listing
    "new.listing.heading": "Create New Listing",
    "new.listing.name": "Product Name",
    "new.listing.name.holder": "What are you selling?",
    "new.listing.price": "Price Each",
    "new.listing.count": "Item Count",
    "new.listing.desc": "Description",
    "new.listing.desc.holder": "Describe item quality, conditions, delivery options...",
    "new.listing.image.heading": "Product Images",
    "new.listing.upload.desc": "Tap to upload images",
    "new.listing.upload.exceeding": "You can upload a maximum of 6 images.",
    "new.listing.cancel": "Cancel",
    "new.listing.publish": "Publish Listing",
    "new.listing.publishing": "Publishing...",
    "new.listing.discard.heading": "Discard Changes?",
    "new.listing.discard.msg": "You have unsaved listing. Do you want to discard changes?",
    "new.listing.discard": "Discard",
    "new.listing.continue": "Keep Editing",
    "new.listing.error01": "Failed to create listing",
    "new.listing.error02": "An unexpected error occurred",
    "category.heading": "Categories",
    "category.none": "Select Category...",
    "listing.heading": "Products Near You",
    "listing.view.all": "View All",
};

const zh: AppDictionary = {
    // Categories
    "electronics": "电子",
    "fashion": "时尚",
    "vehicles": "车辆",
    "food": "食物",
    "services": "服务",
    "others": "其他的",

    // General
    "auth.loading": "Pi 网络认证",
    "auth.retry": "重试",
    "app.name": "市场",
    "button.edit": "编辑",
    "location.holder": "搜索位置...",
    "location.none": "设置您的位置",
    "search.holder": "搜索您附近的商品……",

    // Onboarding
    "auth.login": "请通过Pi浏览器登录。",
    "onboarding.choose.lang": "选择您的语言",
    "onboarding.name": "你的名字",
    "onboarding.name.holder": "请输入您的姓名……",
    "onboarding.name.info": "您的显示名称只能设置一次，之后无法更改。",
    "onboarding.confirm.heading": "确认显示名称",
    "onboarding.confirm.message": "你的名字只能设置一次，这就是你的名字",
    "onboarding.confirm": "确认",
    "onboarding.cancel": "取消",
    "onboarding.continue": "继续",
    "onboarding.remind": "您可以随时在个人资料中更改语言。",
    "onboarding.unknown.error": "出错了，请重试。",
    "onboarding.name.error": "请输入您的显示名称。",
    "onboarding.name.warning": "名称必须至少包含 2 个字符。",

    // Notification
    "notification.heading": "通知",
    "notification.mark.read": "标记为已读",
    "notification.none": "没有通知。",

    // Listing
    "new.listing.heading": "创建新列表",
    "new.listing.name": "产品名称",
    "new.listing.name.holder": "你在卖什么？",
    "new.listing.price": "单价",
    "new.listing.count": "物品数量",
    "new.listing.desc": "产品描述",
    "new.listing.desc.holder": "描述商品质量、状况、配送方式……",
    "new.listing.image.heading": "产品图片",
    "new.listing.upload.desc": "点击上传图片",
    "new.listing.upload.exceeding": "您最多只能上传 6 张图片。",
    "new.listing.cancel": "取消",
    "new.listing.publish": "发布列表",
    "new.listing.publishing": "出版...",
    "new.listing.discard.heading": "放弃更改？",
    "new.listing.discard.msg": "您有未保存的房源信息。是否要放弃更改？",
    "new.listing.discard": "丢弃",
    "new.listing.continue": "继续编辑",
    "new.listing.error01": "创建列表失败",
    "new.listing.error02": "发生意外错误",
    "category.heading": "类别",
    "category.none": "选择类别...",
    "listing.heading": "您附近的商品",
    "listing.view.all": "查看全部",
};

const ru: AppDictionary = {
    // Categories
    "electronics": "Электроника",
    "fashion": "Мода",
    "vehicles": "Транспортные средства",
    "food": "Еда",
    "services": "Услуги",
    "others": "Другие",

    // General
    "auth.loading": "Аутентификация сети Pi",
    "auth.retry": "Попробуйте еще раз",
    "app.name": "Маркет",
    "button.edit": "Редактировать",
    "location.holder": "Поиск местоположения...",
    "location.none": "Укажите ваше местоположение",
    "search.holder": "Ищите товары рядом с вами...",

    // Onboarding
    "auth.login": "Пожалуйста, войдите в систему через браузер Pi.",
    "onboarding.choose.lang": "Выберите язык",
    "onboarding.name": "Ваше имя",
    "onboarding.name.holder": "Введите ваше имя...",
    "onboarding.name.info": "Отображаемое имя можно установить только один раз и изменить его позже нельзя.",
    "onboarding.confirm.heading": "Подтвердите отображаемое имя",
    "onboarding.confirm.message": "Ваше имя можно установить только один раз",
    "onboarding.confirm": "Подтверждать",
    "onboarding.cancel": "Отмена",
    "onboarding.continue": "продолжать",
    "onboarding.remind": "Вы можете изменить язык в любое время в своем профиле.",
    "onboarding.unknown.error": "Произошла ошибка, пожалуйста, попробуйте еще раз.",
    "onboarding.name.error": "Пожалуйста, введите ваше отображаемое имя.",
    "onboarding.name.warning": "Имя должно содержать не менее 2 символов.",

    // Notification
    "notification.heading": "Уведомление",
    "notification.mark.read": "Все прочитали",
    "notification.none": "Никаких уведомлений.",

    // Listing
    "new.listing.heading": "Создать новое объявление",
    "new.listing.name": "Название продукта",
    "new.listing.name.holder": "Что вы продаёте?",
    "new.listing.price": "Цена за штуку",
    "new.listing.count": "Считать",
    "new.listing.desc": "Описание",
    "new.listing.desc.holder": "Опишите качество товара, его состояние, варианты доставки...",
    "new.listing.image.heading": "Изображения",
    "new.listing.upload.desc": "Загрузить изображения",
    "new.listing.upload.exceeding": "Загрузите только 6 изображений.",
    "new.listing.cancel": "Отмена",
    "new.listing.publish": "Публиковать",
    "new.listing.publishing": "Издательский...",
    "new.listing.discard.heading": "Отменить изменения?",
    "new.listing.discard.msg": "У вас есть несохраненное объявление. Хотите отменить изменения?",
    "new.listing.discard": "Отказаться",
    "new.listing.continue": "Редактирование",
    "new.listing.error01": "Не удалось создать объявление",
    "new.listing.error02": "Произошла непредвиденная ошибка",
    "category.heading": "Категории",
    "category.none": "Выберите категорию",
    "listing.heading": "Товары рядом с вами",
    "listing.view.all": "Посмотреть все",
};

const vi: AppDictionary = {
    // Categories
    "electronics": "Điện Tử",
    "fashion": "Thời Trang",
    "vehicles": "Xe Cộ",
    "food": "Thực Phẩm",
    "services": "Dịch Vụ",
    "others": "Khác",

    // General
    "auth.loading": "Đăng nhập vào Pi Network",
    "auth.retry": "Thử lại",
    "app.name": "Chợ Trời",
    "button.edit": "Đổi địa điểm",
    "location.holder": "Tìm địa điểm...",
    "location.none": "Chọn địa điểm",
    "search.holder": "Tìm hàng hóa quanh bạn...",

    // Onboarding
    "auth.login": "Bạn hãy đăng nhập bằng Pi Browser.",
    "onboarding.choose.lang": "Chọn Ngôn Ngữ",
    "onboarding.name": "Tên bạn",
    "onboarding.name.holder": "Nhập tên của bạn...",
    "onboarding.name.info": "Tên của bạn chỉ có thể đặt một lần và không thể thay đổi sau này.",
    "onboarding.confirm.heading": "Xác nhận tên",
    "onboarding.confirm.message": "Tên của bạn chỉ có thể đặt một lần, tên của bạn có phải là",
    "onboarding.confirm": "Xác Nhận",
    "onboarding.cancel": "Hủy",
    "onboarding.continue": "Tiếp tục",
    "onboarding.remind": "Bạn có thể thay đổi ngôn ngữ trong Hồ Sơ của bạn.",
    "onboarding.unknown.error": "Có lỗi xảy ra, vui lòng thử lại.",
    "onboarding.name.error": "Vui lòng nhập tên của bạn.",
    "onboarding.name.warning": "Tên phải có ít nhất 2 kí tự.",

    // Notification
    "notification.heading": "Thông báo",
    "notification.mark.read": "Đã xem hết",
    "notification.none": "Không có thông báo",

    // Listing
    "new.listing.heading": "Đăng sản phẩm",
    "new.listing.name": "Tên Sản Phẩm",
    "new.listing.name.holder": "Bạn muốn bán gì?",
    "new.listing.price": "Giá Sản Phẩm",
    "new.listing.count": "Số Lượng",
    "new.listing.desc": "Mô Tả Sản Phẩm",
    "new.listing.desc.holder": "Chi tiết sản phẩm, phương thức giao nhận...",
    "new.listing.image.heading": "Hình Ảnh Sản Phẩm",
    "new.listing.upload.desc": "Bấm vào đây để chọn hình ảnh",
    "new.listing.upload.exceeding": "Bạn chỉ được chọn tối đa 6 hình ảnh",
    "new.listing.cancel": "Hủy",
    "new.listing.publish": "Đăng Bán",
    "new.listing.publishing": "Đang Đăng...",
    "new.listing.discard.heading": "Hủy đăng bán",
    "new.listing.discard.msg": "Bạn muốn hủy đăng bán sản phẩm?",
    "new.listing.discard": "Hủy",
    "new.listing.continue": "Tiếp Tục Đăng",
    "new.listing.error01": "Không thể đăng sản phẩm",
    "new.listing.error02": "Có lỗi xảy ra, không thể đăng sản phẩm",
    "category.heading": "Nhóm Hàng",
    "category.none": "Chọn nhóm hàng...",
    "listing.heading": "Hàng Hóa Quanh Bạn",
    "listing.view.all": "Xem Tất Cả",
};

export const dictionaries: Record<Lang, AppDictionary> = { en, zh, ru, vi };