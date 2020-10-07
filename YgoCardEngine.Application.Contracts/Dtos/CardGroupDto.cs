using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace YgoCardEngine.Application.Contracts.Dtos
{
    public class CardGroupDto
    {
        public Guid Id { get; set; }
        [Required(ErrorMessage = "请输入卡组名称")]
        public string Title { get; set; }
        public string Tag { get; set; }
        [RegularExpression("^[0-9]+(,[0-9]+)*$",ErrorMessage = "卡组格式不正确")]
        public string CardGroupInfo { get; set; }
    }
}
