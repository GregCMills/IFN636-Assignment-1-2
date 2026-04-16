# Links

**EC2 Public URL:** [http://54.206.192.58](http://54.206.192.58)
*note, as of 06/04/2026 the EC2 instance was already automatically shut down. I restarted it to: [http://13.239.114.254](http://13.239.114.254)

**Alternate Public URL:** [http://gregmills.xyz](http://gregmills.xyz)

# Users

To sign in to the application as a customer, you can use this example account:

## Jane Doe - Customer

**Username/email:** [jane@mail.com](mailto:jane@mail.com)

**Password:** password

You can also simply use a google or apple account.

## Randy Doe - Admin

**Username/email:** [randy@mail.com](mailto:randy@mail.com)

**Password:** password

---

# How to use

At any time an admin may access the 'Reset Assets' debug option to reset the database to a static example data with a variety of users and items:
![Reset Assets](resources/Pasted%20image%2020260405232656.png)

The general flow of the application is thus:

1. The customer or admin logs in (see above)
2. The user browses the catalogue of assets to rent.
  ![Browse catalogue](resources/Pasted%20image%2020260405232058.png)
3. The user adds items to their cart and requests to rent them:
  ![Add to cart](resources/Pasted%20image%2020260405232137.png)
4. The admin sees that the user has requested to rent items, and approves them when they see the user has retrieved / paid for the items:
  ![Admin approves rental](resources/Pasted%20image%2020260405232235.png)
5. The user sees that they have rented assets, and when they are finished with them they submit a return request:
  ![Submit return request](resources/Pasted%20image%2020260405232326.png)
6. Once the admin has verified that the user has returned them they either approve the item (putting it as available again), mark it for maintenance (if the item is damaged) or reject it (if the user has not actually returned it):
  ![Admin processes return](resources/Pasted%20image%2020260405232545.png)

---

# Additional Features:

- The admin may create new product groups, product types and specific instances of assets:
![Create assets](resources/Pasted%20image%2020260405232753.png)
- The admin may see an overview of all assets:
![Asset overview](resources/Pasted%20image%2020260405232813.png)
- The admin may see all assets marked for maintenance:
![Maintenance assets](resources/Pasted%20image%2020260405232847.png)

