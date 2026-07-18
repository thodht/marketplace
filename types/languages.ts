export type Lang = "en" | "zh" | "ru" | "vi";

export const LANG_NAMES: Record<Lang, string> = {
    en: "English",
    zh: "中文",
    ru: "Русский",
    vi: "Tiếng Việt",
};

// 1. Strictly define keys for full compile-time autocomplete and safety
export interface AppDictionary {
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
    "onboarding.error": string,
    "onboarding.unknown.error": string,
    "onboarding.name.error": string,
    "onboarding.name.warning": string,

    // Notification
    "notification.heading": string,
    "notification.mark.read": string,
    "notification.none": string,

    // Caterogy
    "category.heading": string,
    "category.electronics": string,
    "category.fashion": string,
    "category.vehicles": string,
    "category.food": string,
    "category.services": string,
    "category.others": string,
    "listing.heading": string,
    "listing.view.all": string,
}


const en: AppDictionary = {
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
    "onboarding.error": "Failed to synchronize user data on server",
    "onboarding.unknown.error": "Something went wrong, please try again.",
    "onboarding.name.error": "Please enter your display name.",
    "onboarding.name.warning": "Name must have at least 2 characters.",

    // Notification
    "notification.heading": "Notification",
    "notification.mark.read": "",
    "notification.none": "No notifications yet.",

    // Listing
    "category.heading": "Categories",
    "category.electronics": "Electronics",
    "category.fashion": "Fashion",
    "category.vehicles": "Vehicles",
    "category.food": "Food",
    "category.services": "Services",
    "category.others": "Others",
    "listing.heading": "Products Near You",
    "listing.view.all": "View All",
};

const zh: AppDictionary = {
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
    "onboarding.cancel": "Отмена",
    "onboarding.continue": "继续",
    "onboarding.remind": "您可以随时在个人资料中更改语言。",
    "onboarding.error": "服务器上的用户数据同步失败",
    "onboarding.unknown.error": "出错了，请重试。",
    "onboarding.name.error": "请输入您的显示名称。",
    "onboarding.name.warning": "名称必须至少包含 2 个字符。",

    // Notification
    "notification.heading": "通知",
    "notification.mark.read": "标记为已读",
    "notification.none": "没有通知。",

    // Listing
    "category.heading": "类别",
    "category.electronics": "电子",
    "category.fashion": "时尚",
    "category.vehicles": "车辆",
    "category.food": "食物",
    "category.services": "服务",
    "category.others": "其他的",
    "listing.heading": "您附近的商品",
    "listing.view.all": "查看全部",
};

const ru: AppDictionary = {
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
    "onboarding.error": "Не удалось синхронизировать пользовательские данные на сервере.",
    "onboarding.unknown.error": "Произошла ошибка, пожалуйста, попробуйте еще раз.",
    "onboarding.name.error": "Пожалуйста, введите ваше отображаемое имя.",
    "onboarding.name.warning": "Имя должно содержать не менее 2 символов.",

    // Notification
    "notification.heading": "Уведомление",
    "notification.mark.read": "Все прочитали",
    "notification.none": "Никаких уведомлений.",

    // Listing
    "category.heading": "Категории",
    "category.electronics": "Электроника",
    "category.fashion": "Мода",
    "category.vehicles": "автомобили",
    "category.food": "Еда",
    "category.services": "Услуги",
    "category.others": "Другие",
    "listing.heading": "Товары рядом с вами",
    "listing.view.all": "Посмотреть все",
};

const vi: AppDictionary = {
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
    "onboarding.error": "Lỗi không thể đồng bộ dữ liệu người dùng.",
    "onboarding.unknown.error": "Có lỗi xảy ra, vui lòng thử lại.",
    "onboarding.name.error": "Vui lòng nhập tên của bạn.",
    "onboarding.name.warning": "Tên phải có ít nhất 2 kí tự.",

    // Notification
    "notification.heading": "Thông báo",
    "notification.mark.read": "Đã xem hết",
    "notification.none": "Không có thông báo",

    // Listing
    "category.heading": "Nhóm Hàng",
    "category.electronics": "Điện Tử",
    "category.fashion": "Thời Trang",
    "category.vehicles": "Xe Cộ",
    "category.food": "Ăn Uống",
    "category.services": "Dịch Vụ",
    "category.others": "Khác",
    "listing.heading": "Hàng Hóa Quanh Bạn",
    "listing.view.all": "Xem Tất Cả",
};

export const dictionaries: Record<Lang, AppDictionary> = { en, zh, ru, vi };