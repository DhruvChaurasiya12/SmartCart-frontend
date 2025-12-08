import {
  Menu,
  User,
  ShoppingCart,
  Sun,
  Moon,
  Search,
  ShoppingBag,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAuthPopup,
  toggleCart,
  toggleSearchBar,
  toggleSidebar,
} from "../../store/slices/popupSlice";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);

  const cartItemsCount =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <>
      <nav className="fixed left-0 w-full top-0 z-50 bg-background backdrop-blur-md border-b border-border ">
        <div className="max-w-7x1 mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* LOGO */}
            <a className="flex items-center gap-2 px-2" href="/">
              <ShoppingBag className="w-7 h-7 text-blue-500" strokeWidth={2.2} />

              <p className="text-2xl font-semibold tracking-tight text-blue-500 flex items-center">
                Smart
                <span className="text-accent font-bold text-orange-300 ml-1">
                  Cart
                </span>
              </p>
            </a>

            {/* RIGHT SIDE ICONS */}
            <div className="flex items-center space-x-2">
              {/* SEARCH OVERLAY */}
              <button
                onClick={() => dispatch(toggleSearchBar())}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </button>

              {/* USER PROFILE */}
              <button
                onClick={() => dispatch(toggleAuthPopup())}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <User className="w-5 h-5 text-foreground" />
              </button>

              {/* CART */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-foreground" />

                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs
                 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <nav className="relative left-0 w-full top-16 z-10 bg-background/80 backdrop-blur-md border-b border-border border-gray-700 border-t">
        <div className="max-w-7x1 mx-auto px-4">
          {/* LEFT HAMBURGER MENU */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
