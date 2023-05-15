package com.codestates.julsinsa.item.entity;

import com.codestates.julsinsa.audit.Auditable;
import com.codestates.julsinsa.cart.entity.ItemCart;
import com.codestates.julsinsa.image.entity.ItemImage;
import com.codestates.julsinsa.review.entity.Review;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class Item extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    private String titleKor;

    private String titleEng;

    private String content;

    @ElementCollection(fetch = FetchType.LAZY)
    private List<String> categories = new ArrayList<>();

    private int price;

    private int capacity;

    private int volume;

    private String country;

    private String aroma;

    private String taste;

    private String field;

    private int sales;
    private int quantity;
    private int discountRate;

    private String profile;

    private int reviewCount;

    private double reviewRating;

    @OneToMany(mappedBy = "item")
    private List<Favorite> favorites = new ArrayList<>();

    @OneToMany(mappedBy = "item")
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "item")
    private List<ItemImage> images = new ArrayList<>();
    //아이템카트, 아이템오더

    @OneToMany(mappedBy = "item")
    private List<ItemCart> itemCarts = new ArrayList<>();

    //관계 편의 메서드
    public void addFavorite(Favorite favorite){
        favorites.add(favorite);
        if(favorite.getItem() != this) {
            favorite.setItem(this);
        }
    }

    public void addReview(Review review){
        reviews.add(review);
        if(review.getItem() != this) {
            review.setItem(this);
        }
    }

    public Item(String titleKor, int price, int capacity) {
        this.titleKor = titleKor;
        this.price = price;
        this.capacity = capacity;
    }
}