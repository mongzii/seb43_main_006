import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ButtonDark, ButtonLight } from "../components/Common/Button";
import { useState, useEffect } from "react";
import axios from "axios";
import Progress from "./Payment/Progress";

type Itemtype = {
  itemId: number;
  quantity: number;
  titleKor: string;
  price: number;
  profile: string;
};
interface CartItemsProps {
  itemCarts: Itemtype[];
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemsProps>({ itemCarts: [] });
  const access_token = `Bearer ${localStorage.getItem("authToken")}`;
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/cart`, {
        // .get(`http://ec2-3-39-189-208.ap-northeast-2.compute.amazonaws.com:8080/cart`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then((res) => {
        // console.log(res);
        console.log(res.data.data);
        setCartItems(res.data.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const [isCheckedAll, setIsCheckedAll] = useState(true);
  const [isCheckedItems, setIsCheckedItems] = useState<Record<number, boolean>>(
    cartItems.itemCarts.reduce<Record<number, boolean>>((acc, cur) => {
      acc[cur.itemId] = true;
      return acc;
    }, {}),
  );

  useEffect(() => {
    setIsCheckedAll(Object.values(isCheckedItems).every((value) => value));
  }, [isCheckedItems]);

  useEffect(() => {
    setIsCheckedItems(
      cartItems.itemCarts.reduce<{ [key: number]: boolean }>((acc, cur) => {
        acc[cur.itemId] = true;
        return acc;
      }, {}),
    );
  }, [cartItems]);

  const checkedItems = cartItems.itemCarts.filter((item) => isCheckedItems[item.itemId]);
  const totalQuantity = checkedItems.reduce((acc, cur) => acc + cur.quantity, 0);
  const totalPrice = checkedItems.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
  const handleCheckout = () => {
    const checkedItems = cartItems.itemCarts.filter((item) => isCheckedItems[item.itemId]);
    navigate("/payment", { state: { items: checkedItems } });
  };
  const handleCheckAll = () => {
    setIsCheckedAll(!isCheckedAll);
    setIsCheckedItems(
      cartItems.itemCarts.reduce<{ [key: number]: boolean }>((acc, cur) => {
        acc[cur.itemId] = !isCheckedAll;
        return acc;
      }, {}),
    );
  };
  const handleCheckItem = (id: number) => {
    setIsCheckedItems((prev) => {
      const newState = { ...prev };
      newState[id] = !newState[id];
      const isCheckedAll = Object.values(newState).every((value) => value);
      setIsCheckedAll(isCheckedAll);
      return newState;
    });
  };
  const handleDecreaseQuantity = (id: number) => {
    setCartItems((prevItems) => ({
      itemCarts: prevItems.itemCarts.map((cartItem) => {
        if (cartItem.itemId === id && cartItem.quantity > 1) {
          return { ...cartItem, quantity: cartItem.quantity - 1 };
        }
        return cartItem;
      }),
    }));

    setIsCheckedItems((prev) => ({
      ...prev,
      [id]: true,
    }));
  };
  const handleIncreaseQuantity = (id: number) => {
    setCartItems((prevItems) => ({
      itemCarts: prevItems.itemCarts.map((item) => {
        if (item.itemId === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    }));
    setIsCheckedItems((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleDeleteSelectedItems = async () => {
    const selectedIds = Object.keys(isCheckedItems).filter((id) => isCheckedItems[parseInt(id)]);
    const newCartItems = {
      itemCarts: cartItems.itemCarts.filter((item) => !selectedIds.includes(String(item.itemId))),
    };
    setCartItems(newCartItems);
    const newCheckedItems = { ...isCheckedItems };
    selectedIds.forEach((id: string) => delete newCheckedItems[parseInt(id)]);
    setIsCheckedItems(newCheckedItems);

    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/cart`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
          "ngrok-skip-browser-warning": "69420", // ngrok cors 에러
        },
        data: { itemIds: selectedIds.map((id) => parseInt(id)) },
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <CartContainer isEmpty={cartItems.itemCarts.length === 0}>
      <h2 className="장바구니">장바구니</h2>

      <div className="main">
        <Progress />
        {cartItems.itemCarts.length > 0 ? (
          <div className="list">
            <div className="listtitle">
              <div className="Allcheckbox">
                <div>
                  <input type="checkbox" className="check" checked={isCheckedAll} onChange={handleCheckAll} />
                  <label className="전체">전체 선택</label>
                </div>
              </div>
              <div className="imglisttitle">제품 이미지</div>
              <div className="infotitle">제품명</div>
              <div className="eachtitle">개수</div>
              <div className="pricetitle">가격</div>
            </div>
            {cartItems.itemCarts.map((item) => (
              <div key={item.itemId} className="cartitem">
                <div className="checkbox">
                  <input
                    type="checkbox"
                    className="check"
                    checked={isCheckedItems[item.itemId] || false}
                    onChange={() => handleCheckItem(item.itemId)}
                  />
                  <label className="선택"></label>
                </div>
                <div className="imglist">
                  <img src={item.profile} alt={item.titleKor} />
                </div>
                <div className="info">{item.titleKor}</div>
                <div className="eachtag">
                  <button
                    className="decrease-button"
                    disabled={item.quantity === 1}
                    onClick={() => handleDecreaseQuantity(item.itemId)}
                  >
                    -
                  </button>
                  <div className="each">{item.quantity}</div>
                  <button className="increase-button" onClick={() => handleIncreaseQuantity(item.itemId)}>
                    +
                  </button>
                </div>
                <div className="price">{item.price.toLocaleString()} 원</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no data">
            <div className="no data P">장바구니에 담긴 상품이 없습니다.</div>
          </div>
        )}
        {cartItems.itemCarts.length > 0 ? (
          <div className="deleteline">
            <ButtonLight width="120px" height="50px" fontSize="12px" onClick={handleDeleteSelectedItems}>
              선택한 제품 삭제
            </ButtonLight>
            <div className="total">
              <b className="b">
                <b className="b-title">총 개수</b>
                <b>{totalQuantity > 0 ? `${totalQuantity.toLocaleString()}개` : "0개"}</b>
              </b>
              <b className="b">
                <b className="b-title">총 결제 금액</b>
                <b>{totalPrice > 0 ? `${totalPrice.toLocaleString()} 원` : "0원"}</b>
              </b>
            </div>
          </div>
        ) : (
          <div className="empty"></div>
        )}

        <div className="button">
          <div className="buttonDetail">
            <ButtonLight width="160px" height="60px" fontSize="18px" onClick={() => navigate(-1)}>
              뒤로가기
            </ButtonLight>
          </div>
          <div className="buttonDetail">
            <ButtonDark
              width="160px"
              height="60px"
              fontSize="18px"
              onClick={handleCheckout}
              disabled={cartItems.itemCarts.length === 0}
            >
              결제하기
            </ButtonDark>
          </div>
        </div>
      </div>
    </CartContainer>
  );
};

export default Cart;

const CartContainer = styled.section<{ isEmpty: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 150px;

  & div.main {
    width: 100%;
    height: 500px;
    ${({ theme }) => theme.common.flexCenterCol};
  }

  & h2 {
    font-size: 48px;
    font-weight: bold;
    padding-bottom: 20vh;
    height: ${(props) => (props.isEmpty ? "0px" : "500px")};
  }

  & div.list {
    flex-direction: column;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 3vw;
    padding-right: 3vw;
    width: 100%;
    margin-top: 50px;

    & div.Allcheckbox {
      width: 5.47%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      overflow: ;
    }
    & div.checkbox {
      width: 5%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }

  & div.listtitle {
    display: flex;
    align-items: center;
    width: 85%;
    height: 30px;

    border-bottom: 1px solid rgba(60, 60, 60, 0.1);
  }

  & div.cartitem {
    ${({ theme }) => theme.common.flexCenterRow};
    width: 85%;
    font-size: 15px;
    border-bottom: 1px solid rgba(60, 60, 60, 0.1);

    & div.imglist {
      width: 20%;
      height: 250px;
      ${({ theme }) => theme.common.flexCenter};

      & img {
        width: 250px;
        height: 250px;
        object-fit: contain;
      }
    }
    & div.info {
      width: 70%;
      height: 250px;
      ${({ theme }) => theme.common.flexCenter};
      font-size: 16px;
      // 나중에 수정할 사항
    }

    & div.each {
      width: 10%;
      height: 250px;
      ${({ theme }) => theme.common.flexCenter};
    }

    & div.price {
      width: 10%;
      height: 250px;
      ${({ theme }) => theme.common.flexCenter};
    }
  }
  & div.eachtag {
    width: 10%;
    height: 250px;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-around;
  }
  & div.no.data {
    height: 500px;
    padding-top: 150px;
    padding-bottom: 150px;
    ${({ theme }) => theme.common.flexCenter};
  }
  & div.imglisttitle {
    width: 20%;
    ${({ theme }) => theme.common.flexCenter};
  }
  & div.infotitle {
    width: 70%;
    ${({ theme }) => theme.common.flexCenter};
  }

  & div.eachtitle {
    width: 10%;
    ${({ theme }) => theme.common.flexCenter};
  }

  & div.pricetitle {
    width: 9.99%;
    ${({ theme }) => theme.common.flexCenter};
  }

  & div.deleteline {
    width: 83%;
    height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin-bottom: 200px;
  }

  & div.total {
    width: 18%;
    height: 100px;
    flex-direction: row;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    font-size: 16px;

    & b {
      display: flex;
      margin-top: 20px;
      flex-direction: column;
    }
    .b-title {
      border-bottom: 1px solid #222222;
    }
  }
  .b {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 50%;
    height: 30px;
  }

  .button {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 30vw;
    height: 200px;
  }

  .buttonDetail {
    height: 100px;
    width: 150px;
    padding-top: 50px;
    border: none;
  }
  .iecrease-button {
    display: inline-block;
    width: 24px;
    height: 24px;
    padding: 0;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    background-color: #ffffff;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    color: #333333;
    cursor: pointer;
    outline: none;

    &:hover {
      background-color: #f2f2f2;
    }

    &:active {
      transform: translateY(1px);
    }
  }
  .dncrease-button {
    color: #cccccc;

    &:hover {
      background-color: #ffffff;
    }

    &:active {
      transform: none;
    }
  }
  & .check {
    width: 18px;
    height: 18px;
    margin: 0;
    padding: 0;
    cursor: pointer;
    appearance: none;
    outline: none;
    border: 1px solid #dbdbdb;
    border-radius: 4px;

    &:checked {
      background-color: #1976d2;
      border-color: #1976d2;
    }

    &:checked::before {
      content: "\\2713";
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffffff;
      font-size: 16px;
      line-height: 1;
      text-align: center;
    }
  }
  .전체 {
    padding-left: 10px;
    font-size: 12px;
  }
  & div.empty {
    margin-top: 200px;
  }
`;